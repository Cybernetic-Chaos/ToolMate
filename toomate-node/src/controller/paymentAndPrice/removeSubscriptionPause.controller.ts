import getPaypalAccessToken from "../../utils/paypalUtils.js";
import connectDB from "../../db/db.db.js";
import updateSubscriptionQueue from "../../models/updateSubscriptionQueue.model.js";
import userPaymentLogs from "../../models/userPaymentLogs.model.js";
import { Request, Response } from "express";
import axios from "axios";
import { PaymentPlan } from "../../models/admin/paymentPlan.model.js";

// Reusable function for making API requests
async function makePaypalApiRequest(url: string, method: string, data = {}) {
    const accessToken = await getPaypalAccessToken();
    const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;

    try {
        const response = await axios({
            method,
            url: `${BASE_PAYPAL_URL}${url}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data,
        });

        console.log(response, "Is Generated By makePaypalApiRequest");

        return response.data;
    } catch (error: any) {
        console.error(`Error with PayPal API: ${error.message}`);
        throw new Error(`Error with PayPal API: ${error.message}`);
    }
}

async function removeDowngrade(subscriptionId = "", downGradeDuration: number) {
    try {
        const paymentPlans = await PaymentPlan.findOne();
        if (!paymentPlans || !paymentPlans.essentialProductId || !paymentPlans.proProductId) {
            throw new Error("Plans not found");
        }

        const isPro = paymentPlans.proProductId?.includes(subscriptionId);
        const isEssential = paymentPlans.essentialProductId?.includes(subscriptionId);

        if (isPro) {
            return { success: true, message: "Already on topped plan, no update can be done" };
        }

        const downgradeIdx = downGradeDuration === 1 ? 0 : (downGradeDuration === 6 ? 1 : 2);
        const newPlanId = isEssential ? paymentPlans.proProductId[downgradeIdx] : paymentPlans.essentialProductId[downgradeIdx];

        const revisedSubscription = await makePaypalApiRequest(`/v1/billing/subscriptions/${subscriptionId}/revise`, 'post', { plan_id: newPlanId });

        return {
            success: true,
            data: revisedSubscription,
            message: "Plan downgraded successfully on PayPal"
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

async function reactivateSubscription(subscriptionId: string) {
    try {
        const result = await makePaypalApiRequest(`/v1/billing/subscriptions/${subscriptionId}/activate`, 'post', { reason: 'Reactivating subscription for user' });
        console.log("Subscription reactivated:", result);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: `Error reactivating subscription: ${error.message}` };
    }
}

export async function removeSubscriptionPause(req: Request, res: Response) {
    await connectDB();
    try {
        const { subscriptionId, userId, message, isRemoveDowngrade, downgradeDuration } = req.body;

        // Input validation
        if (!subscriptionId || !userId || !message || (isRemoveDowngrade && !downgradeDuration)) {
            return res.status(400).json({ success: false, message: 'Please provide subscriptionId, userId, message, and if isRemoveDowngrade is true, downgradeDuration' });
        }

        const validMessages = ['downgrade', 'suspend', 'cancel'];
        if (!validMessages.includes(message)) {
            return res.status(400).json({ success: false, message: 'Invalid message type. Use downgrade, suspend, or cancel' });
        }

        const validDowngradeDurations = [1, 6, 12];
        if (isRemoveDowngrade && !validDowngradeDurations.includes(downgradeDuration)) {
            return res.status(400).json({ success: false, message: 'Invalid downgrade duration. Use 1, 6, or 12' });
        }

        // Check existing requests and logs
        const [existingRequest, existingLog] = await Promise.all([
            updateSubscriptionQueue.findOne({ subscriptionId, userId }).sort({ createdAt: -1 }).limit(1),
            userPaymentLogs.findOne({ subscriptionId, userId }).sort({ createdAt: -1 }).limit(1),
        ]);

        if (!existingRequest) {
            return res.status(404).json({ success: false, message: 'No request found for this subscription' });
        }

        if (existingRequest.type !== message) {
            return res.status(400).json({ success: false, message: 'Request type mismatch' });
        }

        if (!existingLog) {
            return res.status(404).json({ success: false, message: 'No payment logs found; transaction never made' });
        }

        // Handle Downgrade or Reactivate
        if (isRemoveDowngrade) {
            const downgradeResponse = await removeDowngrade(subscriptionId, downgradeDuration);
            if (!downgradeResponse.success) {
                return res.status(500).json(downgradeResponse);
            }
        } else {
            const reactivateResponse = await reactivateSubscription(subscriptionId);
            if (!reactivateResponse.success) {
                return res.status(500).json(reactivateResponse);
            }
        }

        // Update database and log actions
        const [removeRequest, newDbLog] = await Promise.all([
            updateSubscriptionQueue.findOneAndDelete({ subscriptionId, userId }),
            userPaymentLogs.create({
                subscriptionId,
                userId,
                status: `Request ${message} Removed: ${existingRequest.type}`,
                isCouponApplied: existingLog.isCouponApplied,
                couponCode: existingLog.couponCode,
                baseBillingPlanId: existingLog.baseBillingPlanId,
                planName: existingLog.planName,
            }),
        ]);

        if (!removeRequest || !newDbLog) {
            return res.status(500).json({ success: false, message: 'Error removing request or creating new log' });
        }

        return res.status(200).json({ success: true, message: 'Request removed successfully' });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: `Error fetching subscription details: ${error.message}` });
    }
}

import { Request, Response } from "express";
import axios from "axios";
import userRefundLogs from "../../../models/userRefundLogs.model.js";
import { UserPayment } from "../../../models/userPayment.model.js";
import connectDB from "../../../db/db.db.js";
import getPaypalAccessToken from "../../../utils/paypalUtils.js";
import UserChat from "../../../models/userChat.model.js";
import userPaymentLogs from "../../../models/userPaymentLogs.model.js";
import { deleteRedisData } from "../../../services/redis.js";
import User from "../../../models/user.model.js";

interface RefundResult {
    success: boolean;
    data: any;
    error?: string;
}
interface PayPalTransaction {
    id: string;
    time: string;
    amount: {
        value: number;
        currency_code: string;
    };
}

const CONFIG = {
    PAYPAL_BASE_URL: process.env.PAYPAL_API_BASE_URL,
    DEFAULT_CURRENCY: "USD",
    TRANSACTION_LOOKUP_DAYS: 7,
    HTTP_TIMEOUT: 10000,
} as const;

const paypalAxios = axios.create({
    baseURL: CONFIG.PAYPAL_BASE_URL,
    timeout: CONFIG.HTTP_TIMEOUT,
    headers: { "Content-Type": "application/json" },
});

export async function paymentRefundRequest(req: Request, res: Response) {
    await connectDB();
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required.",
                success: false,
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const userPayment = await UserPayment.findOne({ userId }).sort({ createdAt: -1 });
        if (!userPayment || !userPayment.activePlan || !(userPayment.planAccess[1] || userPayment.planAccess[2])) {
            return res.status(400).json({ message: "No payment found.", success: false });
        }

        const subscriptionId = userPayment.activePlan;
        const accessToken = await getPaypalAccessToken();
        const subscriptionDetails = await getSubscriptionDetails(subscriptionId, accessToken);
        if (!subscriptionDetails.success) {
            return res.status(500).json({ message: subscriptionDetails.error });
        }

        const isEligible = await isEligibleForRefund(userId, String(subscriptionDetails.data.start_time));
        if (!isEligible.success) {
            return res.status(400).json({ message: isEligible.data, success: true });
        }

        const transactions = await getSubscriptionTransactions(subscriptionId, accessToken);
        if (!transactions.success) {
            return res.status(500).json({ message: transactions.error });
        }

        await deactivateSubscription(subscriptionId, accessToken);
        const eligibleTransaction = findEligibleTransaction(
            transactions.data,
            new Date(subscriptionDetails.data.start_time)
        );
        if (!eligibleTransaction) {
            return res.status(400).json({ message: "No eligible transactions for refund." });
        }

        const refundResult = await refundPayment(eligibleTransaction.id, null, CONFIG.DEFAULT_CURRENCY, accessToken);
        if (!refundResult.success) {
            return res.status(500).json({ message: refundResult.error });
        };

        const refundDetails = await getRefundDetailsFromPayPal(refundResult.data.id, accessToken);

        await userRefundLogs.create({
            refundId: refundResult.data.id,
            userId,
            status: refundResult.data.status,
            amount: `${refundDetails.data.amount.value} ${refundDetails.data.amount.currency_code}`,
        });

        await UserPayment.updateOne(
            { userId },
            { $set: { planAccess: [true, false, false], activePlan: "" } }
        );

        const paymentLog = await userPaymentLogs.findOne({ userId, subscriptionId });
        if (!paymentLog) {
            return res.status(404).json({ message: "Payment log not found.", success: false });
        }
        await userPaymentLogs.create({
            userId,
            subscriptionId,
            isCouponApplied: paymentLog.isCouponApplied,
            couponCode: paymentLog.couponCode,
            baseBillingPlanId: paymentLog.baseBillingPlanId,
            planName: paymentLog.planName,
            status: "Subscription CANCELLED Refund Issued And Processing.",
        });

        await deleteRedisData(`USER-PAYMENT-${user.clerkUserId}`);
        return res.status(200).json({
            message: "Refund processed successfully.",
            refund: refundResult.data,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "An error occurred during refund processing.",
            error: error.message,
        });
    }
}

async function getRefundDetailsFromPayPal(refundId: string, accessToken: string) {
    try {
        const BASE_API_URL = process.env.PAYPAL_API_BASE_URL;
        const response = await axios.get(`${BASE_API_URL}/v2/payments/refunds/${refundId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            data: `Failed to fetch refund details: ${error.response?.data || error.message}`,
        };
    }
}

async function getSubscriptionDetails(subscriptionId: string, accessToken: string): Promise<RefundResult> {
    try {
        const response = await paypalAxios.get(`/v1/billing/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, data: null, error: `Failed to fetch subscription details: ${error.message}` };
    }
}

async function getSubscriptionTransactions(subscriptionId: string, accessToken: string): Promise<RefundResult> {
    try {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - CONFIG.TRANSACTION_LOOKUP_DAYS);
        const response = await paypalAxios.get(
            `/v1/billing/subscriptions/${subscriptionId}/transactions`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    start_time: startTime.toISOString(),
                    end_time: new Date().toISOString(),
                },
            }
        );
        return { success: true, data: response.data.transactions };
    } catch (error: any) {
        return { success: false, data: null, error: `Failed to fetch subscription transactions: ${error.message}` };
    }
}

async function refundPayment(
    captureId: string,
    amount: number | null,
    currency: string,
    accessToken: string
): Promise<RefundResult> {
    try {
        const payload = amount ? { amount: { value: amount, currency_code: currency } } : {};
        const response = await paypalAxios.post(`/v2/payments/captures/${captureId}/refund`, payload, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, data: null, error: `Refund failed: ${error.message}` };
    }
}

async function deactivateSubscription(subscriptionId: string, accessToken: string): Promise<RefundResult> {
    try {
        const response = await paypalAxios.post(
            `/v1/billing/subscriptions/${subscriptionId}/cancel`,
            { reason: "User requested cancellation" },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            error: `Failed to deactivate subscription: ${error.message}`,
        };
    }
}

function findEligibleTransaction(transactions: PayPalTransaction[], startTime: Date): PayPalTransaction | null {
    return transactions.find(t => {
        const time = new Date(t.time);
        return time >= startTime && time <= new Date();
    }) || null;
}

async function isEligibleForRefund(userId: string, startTime: string) {
    const subStartTime = new Date(startTime);
    const daysDifference = (new Date().getTime() - subStartTime.getTime()) / (1000 * 3600 * 24);

    if (daysDifference > 7) {
        return {
            success: false,
            data: "Subscription is not eligible for refund. Refund only within 7 days of subscription start.",
        };
    }

    const chats = await UserChat.findOne({ userId, createdAt: { $gt: subStartTime } });
    if (chats) {
        return {
            success: false,
            data: "Subscription is not eligible for refund. User has used premium service.",
        };
    }

    return { success: true, data: "Subscription is eligible for refund." };
}

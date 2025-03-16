import OverDueList from "../../models/OverDueList.model.js";
import { Request, Response } from "express";
import { fetchPaypalSubscription } from "./handleUserPaidAndPersonalInfo.controller.js";
import { UserPayment } from "../../models/userPayment.model.js";
import userPaymentLogs from "../../models/userPaymentLogs.model.js";
import { deleteRedisData } from "../../services/redis.js";
import User from "../../models/user.model.js";
import connectDB from "../../db/db.db.js";

// This function checks if overdue plans of the user are paid and, if so, returns platform access to the user 

export async function revokeOverDuePlan(req: Request, res: Response) {
    await connectDB();
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User id is required", success: false, route: '/overdue' });
        }
        const user = await User.findById(userId);
        if (!user || !user.clerkUserId) {
            return res.status(404).json({ message: "User not found!", success: false, route: '/overdue' });
        }
        const overDueList = await OverDueList.findOne({ userId }).sort({ createdAt: -1 });
        if (!overDueList) {
            return res.status(200).json({ message: "No overdue plan found for the user!", success: false, route: '/dashboard' });
        }

        const { subscriptionId } = overDueList;
        if (!subscriptionId) {
            return res.status(200).json({ message: "No subscription ID found for the overdue plan!", success: false, route: '/overdue' });
        }

        const isPlanPaid = await reactivateSubscription(userId, user.clerkUserId, subscriptionId);
        if (isPlanPaid.success) {
            // Successfully paid, remove from overdue list and restore access
            await OverDueList.deleteOne({ userId });
            const newPlanAccess = [false, false, false]
            newPlanAccess[overDueList.planAccess] = true;
            const userPaymentDetails = await UserPayment.findByIdAndUpdate(userId, { planAccess: newPlanAccess, activePlan: overDueList.subscriptionId });
            if (!userPaymentDetails) {
                return res.status(200).json({ message: "Unable to update user payment details! please try after some Time", success: false, route: '/overdue' });
            }
            return res.status(200).json({
                message: "Plan is paid and access is restored.",
                success: true,
                route: '/dashboard',
            });
        } else {
            return res.status(200).json({
                message: `Unable to reactivate subscription: ${isPlanPaid.message}`,
                success: false,
                route: '/overdue',
            });
        }

    } catch (error: any) {
        console.error("Error in revokeOverDuePlan:", error.message);
        return res.status(500).json({ message: "Internal server error", success: false, route: '/overdue' });
    }
}

// This function attempts to reactivate a user's subscription if it's overdue but paid
async function reactivateSubscription(userId: string, clerkId: string, subscriptionId: string): Promise<{ success: boolean, message: string }> {
    try {
        const subDetails = await fetchPaypalSubscription(subscriptionId);
        if (!subDetails || !subDetails.billing_info) {
            const message = `Subscription details not found for subscriptionId: ${subscriptionId}`;
            console.error(message);
            return { success: false, message };
        }

        const { next_billing_time: nextBillingTime, status, outstanding_balance } = subDetails.billing_info;
        const outstandingBalance = parseFloat(outstanding_balance.value);

        // Check if subscription is active and outstanding balance is cleared
        if (status === "ACTIVE" && outstandingBalance <= 0) {
            // Fetch user payment details
            const userPaymentDetails = await UserPayment.findOne({ userId });
            if (!userPaymentDetails) {
                const message = `No payment details found for userId: ${userId}`;
                console.error(message);
                return { success: false, message };
            }

            // Update user payment details to reactivate access
            userPaymentDetails.planAccess = [true, true, true]; // Assuming this enables full access again
            userPaymentDetails.activePlan = 'ACTIVE'; // Restore the active plan
            await userPaymentDetails.save();
            await deleteRedisData(`USER-PAYMENT-${clerkId}`); // Clear cached payment details
            // Retrieve the last log entry of the paused subscription
            const previousLog = await userPaymentLogs.findOne({
                userId,
                subscriptionId,
                status: { $in: ["Subscription PAUSED", "PAUSED"] },
            });

            if (!previousLog) {
                const message = `No previous log entry found for subscription ${subscriptionId}`;
                console.error(message);
                return { success: false, message };
            }

            // Log the reactivation action
            await userPaymentLogs.create({
                userId,
                subscriptionId,
                status: 'Subscription REACTIVATED: Payment received and access restored',
                baseBillingPlanId: previousLog.baseBillingPlanId || '',
                planName: previousLog.planName || '',
                isCouponApplied: previousLog.isCouponApplied || false,
                couponCode: previousLog.couponCode || '',
            });

            const message = `Subscription ${subscriptionId} reactivated and access restored for user ${userId}`;
            console.log(message);
            return { success: true, message }; // Successfully reactivated the subscription
        } else {
            const message = `Subscription ${subscriptionId} is not active or there is an outstanding balance of $${outstandingBalance}.`;
            console.log(message);
            return { success: false, message };
        }
    } catch (error: any) {
        const message = `Error reactivating subscription ${subscriptionId} for user ${userId}: ${error.message}`;
        console.error(message);
        return { success: false, message };
    }
}

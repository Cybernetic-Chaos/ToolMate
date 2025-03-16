import { UserPayment } from "../../../models/userPayment.model.js";
import connectDB from "../../../db/db.db.js";
import UserChat from "../../../models/userChat.model.js";
import getPaypalAccessToken from "../../../utils/paypalUtils.js";
import axios from "axios";
import { Request, Response } from "express";



export async function isEligibleForRefund(req: Request, res: Response) {

    try {
        await connectDB();
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required", success: false, isEligible: false });
        }

        const userSub = await UserPayment.findOne({ userId }).lean();

        if (!userSub || !userSub.activePlan) {
            return res.status(200).json({ message: "No active subscription found", success: false, isEligible: false });
        }

        const subscriptionData = await getSubscriptionData(userSub.activePlan);
        if (!subscriptionData.success) {
            return res.status(200).json({ message: "Subscription not found", success: false, isEligible: false });
        }

        const status = subscriptionData.data.status;
        if (status !== "ACTIVE") {
            return res.status(200).json({
                message: `Subscription not eligible for refund. Current status: ${status}`,
                isEligible: false,
                success: false,
            });
        }

        const startTime = new Date(subscriptionData.data.start_time);
        const daysDifference = (new Date().getTime() - startTime.getTime()) / (1000 * 3600 * 24);

        if (daysDifference > 7) {
            return res.status(200).json({
                message: "Refund can only be requested within 7 days of subscription start date",
                isEligible: false,
                success: false,
            });
        }

        console.log("Checking for user chats", startTime);
        const chats = await UserChat.find({ userId, createdAt: { $gt: startTime } }).lean();
        console.log("Chats", chats);
        if (chats.length > 0) {
            return res.status(200).json({
                message: "User has started using premium service, refund not eligible",
                isEligible: false,
                success: false,
            });
        }

        return res.status(200).json({
            message: "Subscription eligible for refund",
            isEligible: true,
            success: true,
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message, success: false, isEligible: false });
    }
}

async function getSubscriptionData(subscriptionId: string) {
    try {
        const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;
        const cachedAccessToken = await getPaypalAccessToken();
        const response = await axios.get(`${BASE_PAYPAL_URL}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${cachedAccessToken}` },
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, data: `Error fetching subscription details: ${error.response?.data || error.message}` };
    }
}

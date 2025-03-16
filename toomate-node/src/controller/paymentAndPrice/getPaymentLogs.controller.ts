import userPaymentLogs from "../../models/userPaymentLogs.model.js";
import connectDB from "../../db/db.db.js";
import { Request, Response } from "express";

export async function getSubscriptionLogs(req: Request, res: Response) {
    await connectDB();
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const paymentLogs = await userPaymentLogs.find({ userId }).sort({ createdAt: -1 }).select("-__v -updatedAt");
        if (paymentLogs.length === 0) {
            return res.status(404).json({ message: "No payment logs found." });
        }
        return res.status(200).json({ logs: paymentLogs });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });

    }
}
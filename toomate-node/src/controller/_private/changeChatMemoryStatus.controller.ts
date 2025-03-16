import connectDB from "../../db/db.db.js";
import { deleteRedisData, setRedisData } from "../../services/redis.js";
import { Request, Response } from "express";
import UserChat from "../../models/userChat.model.js";

export async function changeChatMemoryStatus(req: Request, res: Response) {
    await connectDB();
    try {
        const { userStatus, sessionId } = req.body;
        if (typeof userStatus !== 'boolean' || typeof sessionId !== 'string') {
            return res.status(400).json({ message: "Invalid data types for userStatus or sessionId" });
        }
        const sessionChat = await UserChat.findOneAndUpdate({ sessionId: sessionId }, { isMateyMemoryOn: userStatus }, { new: true });
        if (!sessionChat) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({ message: "Chat memory status updated successfully", data: sessionChat, isMateyMemoryOn: userStatus });

    } catch (error: any) {
        console.error('Error setting data to Redis:', error);
        throw new Error(error.message);
    }
}

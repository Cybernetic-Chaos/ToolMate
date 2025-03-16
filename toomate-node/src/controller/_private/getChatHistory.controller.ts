import UserChat from "../../models/userChat.model.js";
import connectDB from "../../db/db.db.js";
import { Request, Response } from "express";
import { categorizeChatSessions } from "../../utils/utilsFunction.js";

export async function getChatHistory(req: Request, res: Response) {
    await connectDB();
    try {
        const { userId } = await req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Please provide userId"
            })
        }

        const userChat = await UserChat.find({ userId });
        const reducedChat = userChat.reduce((acc: any[], curr) => {
            const newElem = {
                sessionId: curr.sessionId,
                chatName: curr.chatName,
                updatedAt: curr.updatedAt,
                id: curr._id
            };
            acc.push(newElem);
            return acc;
        }, []);

        return res.status(200).json({
            success: true,
            status: 200,
            data: categorizeChatSessions(reducedChat)
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message
        })
    }

}
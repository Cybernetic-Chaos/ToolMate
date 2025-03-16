import connectDB from "../../db/db.db.js";
import { Chat } from "../../models/chat.model.js";
import UserChat from "../../models/userChat.model.js";
import { Request, Response } from "express";
export async function deleteChat(req: Request, res: Response) {
    await connectDB();

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Please Enter all the required fields [ id ]"
            })
        }

        const deletedChat = await UserChat.findByIdAndDelete(id);
        const deletedChatMessages = await Chat.deleteMany({ sessionId: id });

        if (!deletedChat || !deletedChatMessages) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Chat deleted successfully",
            data: deletedChat
        })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Could not delete chat"
        })

    }
}
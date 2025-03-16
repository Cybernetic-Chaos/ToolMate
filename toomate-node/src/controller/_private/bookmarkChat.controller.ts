import connectDB from "../../db/db.db.js";
import User from "../../models/user.model.js";
import { Request, Response } from "express";

export async function bookmarkChat(req: Request, res: Response) {
    await connectDB();

    try {
        const { userId, chatId } = req.body;

        if (!userId || !chatId) {
            return res.status(400).json({
                success: false,
                message: "Please Enter all the required fields [ userId, chatId ]"
            })
        }

        const newData = await User.findByIdAndUpdate(userId, { $push: { bookmarked: chatId } }, { new: true })

        if (!newData) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Chat bookmarked successfully",
            data: newData
        })
    } catch (error: any) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Could not bookmark chat"
        })

    }
}
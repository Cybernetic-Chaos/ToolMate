import connectDB from "../../db/db.db.js";
import UserChat from "../../models/userChat.model.js";
import { Request, Response } from "express";

export async function changeChatName(req: Request, res: Response) {
    await connectDB()
    try {
        const { id, newName } = req.body;

        if( !id || !newName ) {
            return res.status(400).json({
                success: false,
                message: "Please Enter all the required fields [ id, newName ]"
            })
        }


        const newData = await UserChat.findByIdAndUpdate(id, { chatName: newName }, { new: true })

        if (!newData) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Chat name changed successfully",
            data: newData
        })


    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Could not change chat name"
        })
    }
}
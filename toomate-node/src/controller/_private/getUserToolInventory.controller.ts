import connectDB from "../../db/db.db.js";
import User from "../../models/user.model.js";
import UserToolInventory from "../../models/userToolInventory.model.js";
import { Request, Response } from "express";

export async function getUserToolInventory(req: Request, res: Response) {
    await connectDB();

    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const userToolInventory = await UserToolInventory.find({
            userId
        });

        return res.status(200).json({
            success: true,
            data: userToolInventory,
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
import { deleteRedisData } from "../../services/redis.js";
import connectDB from "../../db/db.db.js";
import User from "../../models/user.model.js";
import UserToolInventory from "../../models/userToolInventory.model.js";
import { Request, Response } from "express";

export async function deleteFromUsertoolInventory(req: Request, res: Response) {
    await connectDB();

    try {
        const { userId, toolId } = req.body;
        if (!userId || !toolId) {
            return res.status(400).json({
                success: false,
                message: "userId,toolId are required"
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const deletedToolInventory = await UserToolInventory.findByIdAndDelete(toolId);
        if (!deletedToolInventory) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete tool from user inventory"
            })
        }

        if (user.toolInventory) {
            const index = user.toolInventory.indexOf(toolId);

            if (index > -1) {
                user.toolInventory.splice(index, 1);
            }
        }
        else {
            return res.status(404).json({
                success: false,
                message: "Tool not found in user inventory"
            })
        }

        const savedUser = await user.save();
        if (!savedUser) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete tool from user inventory"
            })
        }
        await deleteRedisData(`USER-TOOL-${user.clerkUserId}`)

        return res.status(200).json({
            success: true,
            message: "Tool deleted from user inventory"
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
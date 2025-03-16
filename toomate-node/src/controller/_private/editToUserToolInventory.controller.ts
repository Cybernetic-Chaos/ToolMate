import { deleteRedisData } from "../../services/redis.js";
import connectDB from "../../db/db.db.js";
import User from "../../models/user.model.js";
import UserToolInventory from "../../models/userToolInventory.model.js";
import { Request, Response } from "express";

export async function editToUserToolInventory(req: Request, res: Response) {
    await connectDB();

    try {
        const { userId, toolId, toolName, toolDescription, toolCount, tags, customFields } = req.body;
        if (!userId || !toolId || !toolName || !toolDescription || !tags || !customFields) {
            return res.status(400).json({
                success: false,
                message: "userId,toolId,toolName,toolDescription,tags are required"
            })
        }

        const seperatedTags = tags.split(",");

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const toolInventory = await UserToolInventory.findByIdAndUpdate(toolId, {
            name: toolName,
            description: toolDescription,
            count: toolCount,
            tags: seperatedTags,
            customFields: customFields
        }, { new: true });
        if (!toolInventory) {
            return res.status(500).json({
                success: false,
                message: "Failed to update tool inventory"
            })
        }
        await deleteRedisData(`USER-TOOL-${user.clerkUserId}`)

        return res.status(200).json({
            success: true,
            message: "Tool inventory updated successfully",
            data: toolInventory
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
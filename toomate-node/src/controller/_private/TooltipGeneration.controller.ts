import connectDB from "../../db/db.db.js";
import UserMemory from "../../models/userMemory.model.js";
import { generateUsefulFact } from "../../services/langchain/langchain.js";
import { Request, Response } from "express";

export async function TooltipGeneration(req: Request, res: Response) {
    await connectDB();
    try {
        const { userId } = await req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            })
        }

        const userMemory = await UserMemory.findOne({
            userId
        });

        let tooltipDescription = "";

        if (!userMemory) {
            tooltipDescription = await generateUsefulFact("");
        }
        else {
            tooltipDescription = await generateUsefulFact(JSON.stringify(userMemory.memory));
        }

        return res.status(200).json({
            success: true,
            tooltip: tooltipDescription,
            statusCode: 200

        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
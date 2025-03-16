import connectDB from "../../db/db.db.js";
import TempSession from "../../models/preview/session.model.js";
import { Request, Response } from "express";

export async function previewDeduct(req: Request, res: Response) {
    await connectDB();
    try {
        const sessionId = req.cookies.session_id;

        if (!sessionId) {
            return res.json({
                success: false,
                message: "Session not found!",
                isTerminate: true
            })
        }

        const session = await TempSession.findOneAndUpdate({ sessionId }, {
            $inc: { credit: -1 }
        }, { new: true });

        if (!session) {
            return res.json({
                success: false,
                message: "Credit system not working!"
            })
        }

        if (session.credit < 0) {
            return res.json({
                success: false,
                message: "Credit exhausted!",
                isTerminate: true
            })
        }

        return res.json({
            succcess: true,
            message: "Credit deducted!",
            creditLeft: session.credit
        })

    } catch (error: any) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}
import TempSession from "../../models/preview/session.model.js";
import connectDB from "../../db/db.db.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { previewLimit } from "../../constants.js";

export async function createSession(req: Request, res: Response) {
    await connectDB();

    if (req.cookies.session_id) {

        const prevSession = await TempSession.findOne({ sessionId: req.cookies.session_id });
        if (prevSession && prevSession.credit > 0) {
            return res.json({
                success: true,
                message: "",
                credit: prevSession.credit
            })

        }
        return res.json({
            success: true,
            message: "Your Free Credit Is Over!",
            isSessionOver: true
        })
    }
    try {
        const sessionId = uuidv4();

        await TempSession.create({
            sessionId,
            credit: previewLimit,
        });

        res.cookie('session_id', sessionId, {
            httpOnly: true,  // Prevents access via JavaScript
            secure: true,    // Requires HTTPS (important in production)
            maxAge: 30 * 24 * 60 * 60 * 1000, // Expiration time (e.g., 30 days)
        });

        return res.json({
            success: true,
            message: "session Added!"
        });
    } catch (error: any) {
        return res.json({
            success: false,
            message: error.message
        })

    }
}
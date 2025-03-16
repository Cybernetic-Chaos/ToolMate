import connectDB from '../db/db.db.js'
import { NextFunction } from "express";

export async function handleConnectDb(req: Request, res: Response, next: NextFunction) {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
}
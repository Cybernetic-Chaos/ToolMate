import connectDB from "../db/db.db.js";
import User from "../models/user.model.js";
import { UserPayment } from "../models/userPayment.model.js";
import { getRedisData, setRedisData } from "../services/redis.js";
import { NextFunction, Response } from "express";

export async function checkSubscription(req: any, res: Response, next: NextFunction) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(505).json({
                success: false,
                message: "Please Provide user data"
            })
        }

        const data = await getRedisData(`USER-PAYMENT-${userId}`)
        if (data.success) {
            const paidUserData = JSON.parse(data.data);
            req.plan = paidUserData.planAccess;
            next()
        }
        else {
            await connectDB();
            const user = await User.findOne({
                clerkUserId: userId
            })
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "user Data not found!"
                })
            }
            const userPayment = await UserPayment.findOne({
                userId: user._id
            })
            if (!userPayment) {
                return res.status(400).json({
                    success: false,
                    message: "user payment info not found!"
                })
            }
            const redisData = {
                id: user._id,
                clerkUserId: userId,
                planAccess: userPayment.planAccess
            }

            await setRedisData(
                `USER-PAYMENT-${userId}`,
                JSON.stringify(redisData),
                60 * 60 * 24
            )
            req.plan = userPayment.planAccess;
            next()
        }
    } catch (error: any) {


    }
}
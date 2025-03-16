import couponCode from "../../models/admin/couponCode.model.js";
import connectDB from "../../db/db.db.js";
import { Request, Response } from "express";

export async function couponCodeValidator(req: Request, res: Response) {
    try {
        await connectDB();

        const { code } = req.body;

        if (!code) {
            return res.status(200).json({
                success: false,
                validationMessage: "Please provide a coupon code"
            });
        }

        const coupon = await couponCode.findOne({
            code: code.trim().toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(200).json({
                success: false,
                validationMessage: "Invalid coupon code. Please try again."
            });
        }
        const date =Date.now()
        if (coupon.expiryDate < date) {
            return res.status(200).json({
                success: false,
                validationMessage: "This coupon has expired."
            });
        }
        if (coupon.limit === coupon.used.length) {
            return res.status(200).json({
                success: false,
                validationMessage: "This coupon has reached its usage limit."
            });
        }

        return res.status(200).json({
            success: true,
            validationMessage: coupon.message,
            discount: coupon.discountPercentage // Assuming there's a discount field
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return res.status(500).json({
            success: false,
            validationMessage: "Something went wrong. Please try again later."
        });
    }
}
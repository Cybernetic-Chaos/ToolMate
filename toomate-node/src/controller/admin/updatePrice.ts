import connectDB from "../../db/db.db.js";
import AdminUser from "../../models/admin/adminUser.model.js";
import { PaymentPlan } from "../../models/admin/paymentPlan.model.js";
import { Request, Response } from "express";

export async function updatePrice(req: Request, res: Response) {
    await connectDB();
    try {
        const { username, password, essentialPrice, proPrice, discountSixMonth, discountYearly } = req.body;
        const admin = await AdminUser.findOne({
            username
        });
        if (!admin) {
            return res.status(400).json({
                message: 'Invalid username or password'
            });
        }
        if (admin.password !== password) {
            return res.status(400).json({
                message: 'Invalid username or password'
            });
        }
        const price = await PaymentPlan.find();
        if (!price || price.length === 0) {
            const newPrice = new PaymentPlan({
                essntialPrice: essentialPrice,
                proPrice: proPrice,
                discountOnSixMonth: discountSixMonth,
                discountOnYearly: discountYearly
            });
            await newPrice.save();

            return res.status(200).json({
                message: 'Price updated successfully'
            });
        }
        const updatedPrice = await price[0].updateOne({
            essntialPrice: essentialPrice,
            proPrice: proPrice,
            discountOnSixMonth: discountSixMonth,
            discountOnYearly: discountYearly
        });

        if (!updatedPrice) {
            return res.status(400).json({
                message: 'Price not updated'
            });
        }

        return res.status(200).json({
            message: 'Price updated successfully'
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
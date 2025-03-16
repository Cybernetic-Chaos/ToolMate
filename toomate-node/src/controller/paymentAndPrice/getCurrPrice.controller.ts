import connectDB from "../../db/db.db.js";
import { PaymentPlan } from "../../models/admin/paymentPlan.model.js";
import { Request, Response } from "express";

export async function getCurrPrice(req: Request, res: Response) {
    await connectDB();
    try {
        const dbPrice = await PaymentPlan.find();
        if (!dbPrice || dbPrice.length === 0) {
            return res.status(404).json({ message: "No payment plans found" });
        }

        const price = dbPrice[0];

        const monthly = [price.essntialPrice, price.proPrice];
        const sixMonth = [
            (price.essntialPrice * 6 * (1 - price.discountOnSixMonth / 100)).toFixed(2),
            (price.proPrice * 6 * (1 - price.discountOnSixMonth / 100)).toFixed(2),
        ];
        const yearly = [
            (price.essntialPrice * 12 * (1 - price.discountOnYearly / 100)).toFixed(2),
            (price.proPrice * 12 * (1 - price.discountOnYearly / 100)).toFixed(2),
        ];
        const _essentialProductId = price.essentialProductId || [];
        const _proProductId = price.proProductId || [];
        let newProductId = {}
        if (_essentialProductId.length >= 3 && _proProductId.length >= 3) {
            newProductId = {
                month: [_essentialProductId[0], _proProductId[0]],
                sixMonth: [_essentialProductId[1], _proProductId[1]],
                year: [_essentialProductId[2], _proProductId[2]]
            }
        }
        console.log(_essentialProductId, _proProductId, newProductId);
        return res.status(200).json({
            month: monthly,
            sixMonth: sixMonth.map(Number), // Ensuring numbers are returned
            year: yearly.map(Number),      // Ensuring numbers are returned
            // essentialProductId: price.essentialProductId,
            // proProductId: price.proProductId,
            productId: newProductId,
            discountOnSixMonth: price.discountOnSixMonth,
            discountOnYearly: price.discountOnYearly
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

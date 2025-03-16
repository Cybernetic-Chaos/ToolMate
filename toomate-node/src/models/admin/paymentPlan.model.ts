import { IPaymentPlan } from "../../types/types.js";
import mongoose, { Document } from "mongoose";


const PaymentPlanSchema = new mongoose.Schema<IPaymentPlan>({
    essntialPrice: {
        type: Number,
        required: true,
        default: 12
    },
    proPrice: {
        type: Number,
        required: true,
        default: 20
    },
    discountOnSixMonth: {
        type: Number,
        required: true,
        default: 15
    },
    discountOnYearly: {
        type: Number,
        required: true,
        default: 30
    },
    // product id for default plans
    essentialProductId: {
        type: [String],
        default: []
    },
    proProductId: {
        type: [String],
        default: []
    },
});

export const PaymentPlan = mongoose.model<IPaymentPlan>('PaymentPlan', PaymentPlanSchema);
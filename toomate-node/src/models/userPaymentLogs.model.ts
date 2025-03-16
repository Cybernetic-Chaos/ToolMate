import mongoose from "mongoose";

const userPaymentLogsSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subscriptionId: {
        type: String,
        required: true
    },
    isCouponApplied: {
        type: Boolean,
        default: false
    },
    couponCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'couponCode',
        default: null,
        set: (v: String) => v === "" ? null : v
    },
    baseBillingPlanId: {
        type: String,
        default: null
    },
    planName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const userPaymentLogs = mongoose.model('userPaymentLogs', userPaymentLogsSchema);
export default userPaymentLogs;
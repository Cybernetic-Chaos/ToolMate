import mongoose from "mongoose";


const couponCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    limit: {
        type: Number,
        default: Infinity
    },
    used: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    firstBillingCycleOnly: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: (function (this: any) {
            return `Code Found ! Get ${this.discountPercentage}% off ${this.firstBillingCycleOnly ? 'on first billing cycle only' : 'For Lifetime'}`;
        })
    }
}, { timestamps: true });

const couponCode = mongoose.model('couponCode', couponCodeSchema);
export default couponCode;
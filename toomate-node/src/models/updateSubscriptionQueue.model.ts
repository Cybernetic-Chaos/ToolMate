import mongoose from "mongoose";

const updateSubscriptionQueueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatePlanDate: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['suspend', 'cancel', 'downgrade','resume'], // it can be suspend, cancel, or downgrade request
        required: true
    },
    updatePlanAccessTo: {
        type: Number,
        required: true
    },
    subscriptionId: {
        type: String,
        required: true
    },
    // the index of the plan to be downgraded to
    downgradePlanIndex: {
        type: Number,
        default: 0
    }   
}, { timestamps: true });

const updateSubscriptionQueue = mongoose.model('updateSubscriptionQueue', updateSubscriptionQueueSchema);
export default updateSubscriptionQueue;
import mongoose from "mongoose";

const OverDueListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type:String,
        required: true
    },
    planAccess:{
        type: Number,
        required: true
    }
},{timestamps: true});

const OverDueList = mongoose.model('OverDueList', OverDueListSchema);
export default OverDueList;
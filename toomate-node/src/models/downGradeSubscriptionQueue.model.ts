import mongoose from "mongoose";

const downGradeSubscriptionQueue = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    oldSubscriptionId:{
        type:String,
        required:true
    },
    newSubscriptionId:{
        type:String,
        required:true
    },
    updatePlanAccess:{
        type:Number,
        required:true
    },
    updatePlanDate:{
        type:Date,
        required:true
    }
},{timestamps:true})
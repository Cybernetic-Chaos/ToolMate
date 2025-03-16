import mongoose from "mongoose";

const paymentSessionSchema = new mongoose.Schema({
    ba:{
        type:String,
        required:true,
    },
    planName:{
        type:String,
        required:true,
    },
    planAcccesToBeGranted:{
        type:Number,
        required:true,
    },
    baseBillingPlanId:{
        type:String,
        default:null,
    },
    couponCodeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"couponCode",
        default:null
    }
},{timestamps:true});

const PaymentSession = mongoose.model('PaymentSession', paymentSessionSchema);
export default PaymentSession;
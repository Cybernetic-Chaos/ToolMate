import mongoose from "mongoose";

const BunningsProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    image:{
        type: String,
        default: ""
    },
    link:{
        type: String,
        default:""
    },
    searchTerm:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    personalUsage:{
        type: String,
        default: ""
    }
},{ timestamps: true });

const BunningsProduct = mongoose.model("BunningsProduct", BunningsProductSchema);

export default BunningsProduct;
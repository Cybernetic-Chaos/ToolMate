import mongoose from "mongoose";

const productCatagory = new mongoose.Schema({
    catagoryName: {
        type: String,
        required: true
    },
    avaragePrice:{
        type: Number,
        required: true
    }
})

const ProductCatagory = mongoose.model('ProductCatagory', productCatagory);
export default ProductCatagory;
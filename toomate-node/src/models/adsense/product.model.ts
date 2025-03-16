import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 100, index: true },
    imageParams: { type: [String], required: true },
    url: { type: String, required: true, index: true },
    description: { type: String, required: true },
    offerDescription: { type: String },
    price: { type: Number, required: true },
    catagory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
    }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;

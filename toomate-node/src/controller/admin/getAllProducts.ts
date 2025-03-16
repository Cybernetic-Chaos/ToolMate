import connectDB from "../../db/db.db.js";
import AdminUser from "../../models/admin/adminUser.model.js";
import Product from "../../models/adsense/product.model.js";
import ProductCatagory from "../../models/productCatagory.model.js";
import { Request, Response } from "express";

export async function getAllProducts(req: Request, res: Response) {
    await connectDB();
    try {
        const { username } = req.body;
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const products = await Product.find();
        const catagory = await ProductCatagory.find();
        return res.status(200).json({
            message: 'All products', data: {
                product: products,
                catagory: catagory
            }
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
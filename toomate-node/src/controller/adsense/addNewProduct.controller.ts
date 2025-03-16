import connectDB from "../../db/db.db.js";
import Product from "../../models/adsense/product.model.js";
import { Request, Response } from "express";

export async function addNewProduct(req: Request, res: Response) {
    await connectDB();

    try {
        const { name, imageParams, url, description, offerDescription, catagoryId,price } = req.body;
        if (!name || !imageParams || !url || !description || !offerDescription || !catagoryId || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newProductItem = {
            name,
            imageParams,
            url,
            description,
            offerDescription,
            catagory: catagoryId.map((id: string) => id),
            price
        }

        const productDB = await Product.create(newProductItem);
        if(!productDB){
            return res.status(400).json({ message: 'Failed to add product' });
        }
        res.status(201).json({ 
            message: 'Product added successfully',
            success:true,
            data: productDB 
        });
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal Server Error' });

    }
}
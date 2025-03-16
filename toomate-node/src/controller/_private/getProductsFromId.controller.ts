import connectDB from "../../db/db.db.js";
import Product from "../../models/adsense/product.model.js";
import { Request, Response } from "express";

export async function getProductFromId(req: Request, res: Response) {
    await connectDB();

    try {
        const categories = req.body;
        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({
                message: "Invalid input format",
                success: false,
                statusCode: 400
            });
        }

        // Collect all product IDs from all categories
        const allProductIds = categories.flatMap(category => category.products);

        // Fetch all products in one go
        const products = await Product.find({ _id: { $in: allProductIds } });

        // Create a map of productId to product
        const productMap = new Map(products.map(product => [product._id.toString(), product]));

        // Remap products to their respective categories
        const result = categories.map(category => ({
            categoryName: category.categoryName,
            products: category.products.map((productId: string) => productMap.get(productId))
        }));
        console.log(result, 'result');
        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            statusCode: 200,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            success: false,
            statusCode: 500
        });
    }
}


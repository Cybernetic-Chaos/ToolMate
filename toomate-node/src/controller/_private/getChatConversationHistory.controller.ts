import mongoose from "mongoose";
import connectDB from "../../db/db.db.js";
import { Chat } from "../../models/chat.model.js";
import UserChat from "../../models/userChat.model.js";
import Product from "../../models/adsense/product.model.js";
import BunningsProduct from "../../models/BunningsProduct.model.js";
import { Request, Response } from "express";
import { Document } from "mongoose";
import { getItemDetails } from "@/services/bunnings.js";

export interface IBunningsProduct extends Document {
    name: string;
    price: number;
    image: string;
    link: string;
    searchTerm: string;
    rating: number;
    personalUsage: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdditionalProduct extends Document {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    link: string;
    rating: number;
    personalUsage: string;
}

export interface ProductSuggestion {
    categoryName: string;
    products: string[];
}

export interface ChatEntry {
    sessionId: string;
    message: string;
    role: string;
    isCommunitySuggested: boolean;
    communityId: string[];
    isProductSuggested: boolean;
    productSuggestionList: ProductSuggestion[];
    isMateyProduct: boolean;
    isBunningsProduct: boolean;
    bunningsProductList: string[];
    productId: string[];
    mateyProduct: string[];
    createdAt: Date;
    bunningsData?: BunningsDataEntry[];
    productData?: { categoryName: string; products: AdditionalProduct[] }[];
}

export interface BunningsDataEntry {
    categoryName: string;
    products: IBunningsProduct[];
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalMessages: number;
        hasMore: boolean;
    };
}

export async function getChatConversationHistory(req: Request, res: Response) {
    await connectDB();
    try {
        const { sessionId, userId, pagination } = req.body;

        if (!sessionId || !userId || !pagination) {
            return res.status(400).json({
                success: false,
                message: "Please enter all the required fields [sessionId, userId, pagination].",
            });
        }

        const userChatHistory = await UserChat.findOne({ sessionId }).lean();

        if (!userChatHistory) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        if (String(userChatHistory.userId) !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this chat history.",
            });
        }

        const { page = 1, limit = 10 } = pagination; // sortOrder can be 1 or -1 for ascending/descending order
        const skip = (page - 1) * limit;

        const totalMessages = await Chat.countDocuments({ sessionId });

        // Fetch chat history with proper sorting and pagination
        const chatHistory = await Chat.find({ sessionId })
            .sort({ createdAt: 1 }) // Sort by specified order (ascending or descending)
            // .skip(skip)
            // .limit(limit)
            .lean();

        const newData = await Promise.all(chatHistory.map(processChatEntry));

        res.status(200).json({
            success: true,
            data: newData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasMore: totalMessages > skip + limit,
            },
        });
    } catch (error: any) {
        console.error("Chat History Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}


async function processChatEntry(chat: any): Promise<ChatEntry> {
    const newChatItem: ChatEntry = {
        sessionId: chat.sessionId,
        message: chat.message,
        role: chat.role,
        isCommunitySuggested: chat.isCommunitySuggested,
        communityId: chat.communityId,
        isProductSuggested: chat.isProductSuggested,
        bunningsProductList: chat.bunningsProductList,
        productSuggestionList: chat.productSuggestionList || [],
        isMateyProduct: chat.isMateyProduct,
        isBunningsProduct: chat.isBunningsProduct,
        productId: chat.productId,
        mateyProduct: chat.mateyProduct,
        createdAt: chat.createdAt,
    };


    if (chat.isProductSuggested && chat.productSuggestionList?.length > 0) {
        // Get all unique product IDs from all categories
        const allProductIds = chat.productSuggestionList.reduce((ids: string[], category: ProductSuggestion) => {
            return [...ids, ...category.products];
        }, []);

        // Fetch all products in one query
        const productResponse = await getProductDetails(allProductIds);

        if (productResponse.success && productResponse.data) {
            // Create a map for quick product lookup
            const productMap = new Map(
                productResponse.data.map(product => [product._id.toString(), product])
            );

            // Remap the productSuggestionList with actual product data
            const mergedProductData: Record<string, AdditionalProduct[]> = {};

            chat.productSuggestionList.forEach((category: ProductSuggestion) => {
                if (!mergedProductData[category.categoryName]) {
                    mergedProductData[category.categoryName] = [];
                }
                const products = category.products
                    .map(productId => productMap.get(productId))
                    .filter(product => product !== undefined) as AdditionalProduct[];
                mergedProductData[category.categoryName].push(...products);
            });

            newChatItem.productData = Object.entries(mergedProductData).map(([categoryName, products]) => ({
                categoryName,
                products
            }));
        }
    }

    return newChatItem;
}





async function getProductDetails(productIds: string[]): Promise<{ success: boolean; data?: AdditionalProduct[]; message?: string }> {
    try {
        const products = await Product.find({ _id: { $in: productIds } }).lean<AdditionalProduct[]>();
        return { success: true, data: products };
    } catch (error: any) {
        console.error("Product Details Error:", error);
        return { success: false, message: error.message };
    }
}
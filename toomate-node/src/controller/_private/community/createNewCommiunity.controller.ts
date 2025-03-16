import connectDB from "../../../db/db.db.js";
import { Community } from  "../../../models/community.model.js";
import { Request, Response } from "express";

export async function createNewCommunity(req: Request, res: Response) {
    await connectDB();
    try {
        const communityData = req.body;

        const newCommunity = new Community({
            name: communityData.name,
            description: communityData.description,
            profileImageParams: communityData.profileImageParams,
            bannerImageParams: communityData.bannerImageParams,
        });

        const storeCommmunity = await newCommunity.save();
        if (storeCommmunity) {
            res.status(201).json({ message: 'Community created successfully', community: storeCommmunity });
        }
        else {
            res.status(500).json({ message: 'Failed to create community', community: null });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
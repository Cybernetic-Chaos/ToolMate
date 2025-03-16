import connectDB from "../../db/db.db.js";
import ProductCatagory from "../../models/productCatagory.model.js";
import { Request, Response } from "express";

export async function createCatagory(req:Request,res:Response){
    await connectDB();
    try {
        const {catagoryName} = req.body;
        if(!catagoryName){
            return res.status(400).json({message:'All fields are required'});
        }
        const newCatagory = {
            catagoryName,
            avaragePrice:0
        }
        const catagoryDB = await ProductCatagory.create(newCatagory);
        if(!catagoryDB){
            return res.status(400).json({message:'Failed to add catagory'});
        }
        res.status(201).json({
            message:'Catagory added successfully',
            success:true,
            data:catagoryDB
        });
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({message:'Internal Server Error'});
    }
}
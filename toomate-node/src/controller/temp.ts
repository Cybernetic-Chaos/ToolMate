import { searchBunningsProducts } from "../services/bunnings.js";
import { Request, Response } from "express";

export async function getSearchData(req:Request,res:Response){
    const {searchTerm} = req.body;
    if(!searchTerm){
        return res.status(400).json({message:"Search term is required"});
    }

    const data = await searchBunningsProducts(searchTerm,false,0,0);
    return res.status(200).json(data);
    
}
import connectDB from "../../db/db.db.js";
import UserChat from "../../models/userChat.model.js";
import { Request, Response } from "express";

export async function getChatMemoryStatus(req:Request,res:Response){
    await connectDB();

    try {
        const {sessionId} = req.body;   
        if(typeof sessionId !== 'string'){
            return res.status(400).json({message:"Invalid data types for sessionId",success:false,data:null,status:400});
        }

        const sessionChat = await UserChat.findOne({sessionId}).select('isMateyMemoryOn');
        if(!sessionChat){
            return res.status(404).json({message:"Session not found",success:false,data:null,status:404});
        }

        return res.status(200).json({message:"Chat memory status fetched successfully",success:true,data:sessionChat,status:200});
        
    } catch (error:any) {
        console.error('Error setting data to Redis:', error);
        return res.status(500).json({message:error.message,success:false,data:null,status:500});        
    }
}
import { Request, Response } from "express";

export async function updateChatHistory(req:Request,res:Response){
    try {
        const {userId,newHistory} = await req.body;
        if(!userId || !newHistory){
            return res.status(400).json({
                success:false,
                status:400,
                message:"Please provide userId and newHistory"
            })
        }
        return res.json({
            success:false
        })
    } catch (error:any) {

        return res.status(500).json({
            success:false,
            status:500,
            message:error.message
        })
        
    }
}
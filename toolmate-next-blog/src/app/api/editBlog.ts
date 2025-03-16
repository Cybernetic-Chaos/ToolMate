import { apiError } from "@/lib/apiError";
import { apiResponse } from "@/lib/apiResponse";
import { dbConnect } from "@/lib/dbConnect";
import blogModel from "@/models/blog.model";

export async function POST(req:Request){
    await dbConnect();
    try {
        const {id,title,content,author,tags,slug} = await req.json();
        if(!title || !content || !author || !tags || !slug){
            return Response.json(
                new apiError(400,"Please fill all the fields")
            )
        }
      
        const newblog = await blogModel.findByIdAndUpdate(id,{
            title,
            content,
            author,
            tags,
            slug
        }
        ,{new:true});
        if(!newblog){
            return Response.json(
                new apiError(400,"Error while creating blog")
            )
        }
        return Response.json(
            new apiResponse(200,newblog,"Blog created successfully")
        );

    } catch (error) {
        return Response.json(
            new apiError(500,"Error while creating blog")
        )
        
    }
}
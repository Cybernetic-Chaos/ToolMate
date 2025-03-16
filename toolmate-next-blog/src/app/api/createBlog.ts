import { apiResponse } from "@/lib/apiResponse";
import { dbConnect } from "@/lib/dbConnect";
import blogModel from "@/models/blog.model";
import { ApiError } from "next/dist/server/api-utils";

export async function POST(req:Request){
 await dbConnect();
 try {
    const {title,content,author,tags,slug} = await req.json();
    if(!title || !content || !author || !tags || !slug){
        return Response.json(
            new ApiError(400,"Please fill all the fields")
        )
    }

    const newblog = await blogModel.create({
        title,
        content,
        author,
        tags,
        slug
    });
    if(!newblog){
        return Response.json(
            new ApiError(400,"Error while creating blog")
        )
    }
    return Response.json(
        new apiResponse(200,"Blog created successfully",newblog)
    );
 } catch (error) {
    return Response.json(
        new ApiError(500,"Error while creating blog")
    )
 }
}
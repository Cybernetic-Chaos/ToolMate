import { apiResponse } from "@/lib/apiResponse";
import { dbConnect } from "@/lib/dbConnect";
import blogModel from "@/models/blog.model";
import { ApiError } from "next/dist/server/api-utils";

export async function GET(req:Request){
    await dbConnect();

    try {
        const allblogs = await blogModel.find({});
        if(!allblogs){
            return Response.json(
                new ApiError(400,"No blogs found")
            )
        }

        return Response.json(
            new apiResponse(200,allblogs,"Blogs fetched successfully")
        );

    } catch (error:any) {
        return Response.json(
            new ApiError(500,"Error while fetching blogs")
        )
        
    }
}
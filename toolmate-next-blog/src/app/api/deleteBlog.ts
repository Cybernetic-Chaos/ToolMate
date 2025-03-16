import { apiResponse } from "@/lib/apiResponse";
import { dbConnect } from "@/lib/dbConnect";
import blogModel from "@/models/blog.model";
import { ApiError } from "next/dist/server/api-utils";

export async function DELETE(req:Request){
    await dbConnect();
    const { id } = await req.json();
    try {
        const deletedBlog = await blogModel.findByIdAndDelete(id);
        if(!deletedBlog){
            return Response.json(
                new ApiError(400,"No blog found with this id")
            )
        }
        return Response.json(
            new apiResponse(200,deletedBlog,"Blog deleted successfully")
        );
    } catch (error:any) {
        return Response.json(
            new ApiError(500,"Error while deleting blog")
        )
    }
}
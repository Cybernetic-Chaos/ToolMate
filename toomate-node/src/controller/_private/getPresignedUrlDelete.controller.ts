import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { Request, Response } from 'express';
dotenv.config();

// Set up S3 client
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

export async function getPresignedDeleteUrl(req: Request, res: Response) {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: "Key is required to delete the object"
            });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key, // Object key in the S3 bucket
            Expires: 60 // URL expires in 60 seconds
        };

        const presignedDeleteUrl = await s3.getSignedUrlPromise('deleteObject', params);

        return res.status(200).json({ url: presignedDeleteUrl });
    } catch (error: any) {
        console.error('Error generating delete presigned URL:', error);
        return res.status(500).json({
            success: false,
            message: "Could not get presigned delete URL",
            error: error.message
        });
    }
}
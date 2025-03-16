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

export async function getPresignedUrl(req: Request, res: Response) {
    try {
        const { filename, fileType } = req.body;

        if (!filename || !fileType) {
            return res.status(400).json({
                success: false,
                message: "Filename and fileType are required"
            });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now()}_${filename}`, // Use timestamp to create a unique filename
            Expires: 60, // URL expires in 60 seconds
            ContentType: fileType, // File type to ensure the correct type is uploaded
        };

        const presignedUrl = await s3.getSignedUrlPromise('putObject', params);

        // After generating the presigned URL, you can also create a public URL
        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

        return res.status(200).json({ url: presignedUrl, publicUrl: publicUrl,params:params.Key }); // Include public URL in response
    } catch (error: any) {
        console.error('Error generating presigned URL:', error);
        return res.status(500).json({
            success: false,
            message: "Could not get presigned url",
            error: error.message
        });
    }
}

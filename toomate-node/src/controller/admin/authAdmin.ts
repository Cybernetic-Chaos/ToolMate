import connectDB from "../../db/db.db.js";
import AdminUser from "../../models/admin/adminUser.model.js";
import { Request, Response } from "express";

export async function loginAdmin(req: Request, res: Response) {
    await connectDB();
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        if (admin.password !== password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        return res.status(200).json({
            message: 'Login successfull', data: {
                username: admin.username,
                permissions: admin.permissions
            }
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' });

    }

}
import connectDB from "../../db/db.db";
import AdminUser from "../../models/admin/adminUser.model";
import { Request, Response } from "express";

export async function createAuthUser(req: Request, res: Response) {
    await connectDB();
    try {
        const { username, password, permission, providedUserName, providerPassword } = req.body;
        const admin = await AdminUser.findOne
            ({ providedUserName });
        if (!admin) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (admin.password !== providerPassword) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const newAdmin = {
            username,
            password,
            permissions: permission
        }
        const adminDB = await AdminUser.create(newAdmin);
        if (!adminDB) {
            return res.status(400).json({ message: 'Failed to create user' });
        }
        return res.status(201).json({
            message: 'User created successfully',
            success: true,
            data: adminDB
        })
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' });

    }
}
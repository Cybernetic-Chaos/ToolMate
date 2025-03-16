import connectDB from "../../db/db.db.js";
import AdminUser from "../../models/admin/adminUser.model.js";
import User from "../../models/user.model.js";
import { Request, Response } from "express";

export async function getAllUsers(req: Request, res: Response) {
    await connectDB()
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        if (admin.password !== password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const allUser = await User.find();
        const userReduces = allUser.reduce((acc: { username: string; permissions: string[] }[], user: any) => {
            const { password, ...newUser } = user; // Destructure to remove the password
            acc.push(newUser);
            return acc;
        }, []);

        return res.status(200).json({
            message: 'Login successfull',
            data: userReduces
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal Server Error' });

    }
}
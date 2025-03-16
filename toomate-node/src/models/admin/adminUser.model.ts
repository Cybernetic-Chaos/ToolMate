import { Schema, model, Document } from 'mongoose';

interface IAdminUser extends Document {
    username: string;
    password: string;
    permissions: string[];
}

const AdminUserSchema = new Schema<IAdminUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: { type: [String], required: true }
});

const AdminUser = model<IAdminUser>('AdminUser', AdminUserSchema);

export default AdminUser;
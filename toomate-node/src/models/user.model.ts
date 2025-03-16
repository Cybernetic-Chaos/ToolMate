import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  clerkUserId?: string;
  status: string[];
  toolInventory?: mongoose.Types.ObjectId[];
  wishList: { toolId: string; count: number }[];
  bookmarked: mongoose.Types.ObjectId[];
  currActiveSubscription: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  clerkUserId: {
    type: String,
    unique: true,
  },
  status: {
    type: [String],
    default: ["active"], // can be [active, warned, suspended, blocked]
  },
  toolInventory: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'UserToolInventory',
    default: [],
  },
  bookmarked: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserChat' }],
    default: [],
  }
}, { timestamps: true });


UserSchema.index({ id: 1 });
UserSchema.index({ clerkUserId: 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;



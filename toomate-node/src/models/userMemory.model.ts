import mongoose, { Document, Model, Schema } from "mongoose";


interface IUserMemory extends Document {
    userId: mongoose.Types.ObjectId;
    memory:string[]
}

// all context is stored in Queue Format 
const UserMemorySchema = new mongoose.Schema<IUserMemory>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    memory:{
        type:[String],
        required:true
    }
},{timestamps:true});

UserMemorySchema.index({ userId: 1 });
const UserMemory: Model<IUserMemory> = mongoose.model<IUserMemory>('UserMemory', UserMemorySchema);

export default  UserMemory;

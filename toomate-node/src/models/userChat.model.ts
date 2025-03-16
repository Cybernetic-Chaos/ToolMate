import mongoose from "mongoose";

const userChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    aiSessionMemory:{
        type: [String],
        default: []
    },
    chatName: {
        type: String,
        default: ""
    },
    isMateyMemoryOn: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

userChatSchema.index({ userId: 1 });
userChatSchema.index({ sessionId: 1 });
const UserChat = mongoose.model('UserChat', userChatSchema);
export default UserChat;
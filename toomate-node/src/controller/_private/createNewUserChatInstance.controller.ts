import connectDB from "../../db/db.db.js";
import UserChat from "../../models/userChat.model.js";

export async function createnewUserChatInstace({ sessionId, userId, chatName }: {
    sessionId: string,
    userId: string,
    chatName: string
}) {
    await connectDB();
    const userChat = new UserChat({
        userId,
        sessionId,
        chatName
    });
    await userChat.save();
    if (!userChat) {
        return {
            success: false,
            message: "Error creating new Chat",
            _id:null
        }
    }
    return userChat;
}
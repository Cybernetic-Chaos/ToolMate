import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true
    },
    credit: {
        type: Number,
        required: true
    }
},{timestamps: true});

const TempSession = mongoose.model("Session", sessionSchema);

export default TempSession;
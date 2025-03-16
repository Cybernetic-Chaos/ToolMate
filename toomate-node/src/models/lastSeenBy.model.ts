import mongoose from "mongoose";

const lastSeenBySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    communityId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    last_seen:{
        type: Date,
        default: Date.now
    }
})

const lastSeenBy = mongoose.model('lastSeenBy',lastSeenBySchema);

export default lastSeenBy;
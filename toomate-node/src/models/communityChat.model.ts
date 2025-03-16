import mongoose from 'mongoose';


// for managing each chat from user info specific community
const CommunityChatSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: ' ',
    },
    fileUrls: {
      type: [String], // Array of file URLs
      default: []
    },
    previewUrls: {
      type: [String], // Array of preview image URLs
      default: []
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    seenBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
    },
    isDeletedByAdmin: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

CommunityChatSchema.index({ communityId: 1, userId: 1 });
export const CommunityChat = mongoose.model('CommunityChat', CommunityChatSchema);

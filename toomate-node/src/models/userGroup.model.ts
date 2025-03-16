import mongoose from 'mongoose';
`1`

// this model is used for attaching each user with specific group.
const UserGroupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    role: {
      type: String,
      // enum: ['admin', 'member','moderator'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'kicked', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const UserGroup = mongoose.model('UserGroup', UserGroupSchema);

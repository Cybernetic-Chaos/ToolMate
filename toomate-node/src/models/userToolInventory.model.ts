import mongoose from 'mongoose';

const UserToolInventorySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		count: {
			type: Number,
			default: -1,
		},
		tags: {
			type: [String],
			default: [],
		},
		customFields: {
			type: Object,
			default: {},
		}
	},
	{ timestamps: true }
);

const UserToolInventory = mongoose.model(
	'UserToolInventory',
	UserToolInventorySchema
);

export default UserToolInventory;

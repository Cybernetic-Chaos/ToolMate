import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
	{
		sessionId: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			default: ' ',
		},
		role: {
			type: String,
			default: "ai"
		},
		// to check if there is product 
		isCommunitySuggested: {
			type: Boolean,
			default: false
		},
		communityId: {
			type: [],
			default: []
		},
		isProductSuggested: {
			type: Boolean,
			default: false
		},
		productSuggestionList:{
			type: [],
			default: []
		},
		isMateyProduct:{
			type: Boolean,
			default: false
		},
		isBunningsProduct:{
			type: Boolean,
			default: false
		},
		bunningsProductList:{
			type: [{
				categoryName: String,
				products: [] as any
			}],
			ref: 'BunningsProduct',
			default: null
		},
		productId: {
			type: [],
			default: []
		},
		mateyProduct:{
			type: [],
			default: []
		},
		
		// this field will be used for summury product suggestion , sort last data base entry and show that in product suggestion
		
	},
	{ timestamps: true }
);


ChatSchema.index({ sessionId: 1 });

export const Chat = mongoose.model('Chat', ChatSchema);

import { Chat } from '../../models/chat.model.js';
import { ChatOpenAI } from '@langchain/openai';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import dotenv from 'dotenv';
import connectDB from '../../db/db.db.js';
import { produceMessage, produceNewMessage } from '../kafka.js';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
	RunnablePassthrough,
	RunnableSequence,
} from '@langchain/core/runnables';
import { getPremiumUserChatMessage, parseJsonString, wrapWordsInQuotes } from '../../utils/utilsFunction.js';
import { tool } from "@langchain/core/tools";
import { tools } from './tools.js';
import { getRedisData, setRedisData } from '../redis.js';
import ProductCatagory from '../../models/productCatagory.model.js';
import Product from '../../models/adsense/product.model.js';
import mongoose from 'mongoose';
import User from '../../models/user.model.js';
import UserMemory from '../../models/userMemory.model.js';
import { encode } from 'gpt-tokenizer';
import axios from 'axios';
import BunningsProduct from '../../models/BunningsProduct.model.js';
import { IBunningsChat, IChatMemory } from '../../types/types.js';
import { searchBunningsProducts } from '../bunnings.js';
import { GPT_MODEL1 } from '../../constants.js';

dotenv.config();
const openAIApiKey = process.env.OPENAI_API_KEY!;

const llm = new ChatOpenAI({
	apiKey: openAIApiKey,
	streaming: true, // Enable streaming if supported
	model: GPT_MODEL1,
});

// service for free preview user
export async function GetAnswerFromPrompt(
	prompt: string,
	sessionId: string,
	socket: Socket
) {
	await connectDB();
	const chatHistory = await Chat.find({ sessionId });
	const shortenChatHistory = chatHistory.reduce((acc: any, chat) => {
		if (acc.length > 15) {
			return acc;
		}
		acc = [
			...acc,
			{
				message: chat.message.slice(0, 350),
				role: chat.role,
			},
		];
		return acc;
	}, []);

	let expression: any;

	try {
		const expressionPrompt = `Given is the prompt from user, as per this question, your job is to give 1 expression that fits for this prompt best,try suggest relavent expression. ${prompt} :Expression List(strictly follow this only no other values):[ laugh, hello, smile, offer, 1thumb, 2thumb, tool]: Selected Expression:`;
		expression = await llm.invoke(expressionPrompt);
		socket.emit('expression', expression);
	} catch (error) {
		console.error('Error fetching expression:', error);
		socket.emit(
			'expressionError',
			'Error occurred while fetching expression.'
		);
	}

	try {
		const streamPrompt = `system prompt:, As a DIY and creative enthusiast, provide an appropriate answer to the user's question. 
		| User Prompt: ${prompt} 
		Context of chat: ${JSON.stringify(shortenChatHistory)} 
		Response (provide a comprehensive answer using markdown format, utilizing all available symbols such as headings, subheadings, lists, etc.):`;
		const stream = await llm.stream(streamPrompt);

		let gatheredResponse = '';

		for await (const chunk of stream) {
			gatheredResponse += chunk.content; // Assuming 'content' is the property holding the text
			socket.emit('message', { text: chunk.content });
		}

		socket.emit('terminate', { done: true });
		await produceMessage(
			gatheredResponse,
			sessionId,
			expression?.kwargs?.content || 'laugh',
			'ai'
		);
	} catch (error) {
		console.error('Error streaming response:', error);
		socket.emit('error', 'Error occurred during streaming.');
	}
}

// get intend of user
export async function findAndExecuteIntend(
	prompt: string,
	sessionId: string,
	userId: string,
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
	plan: number
) {
	const chatHistory = await getPremiumUserChatMessage(
		sessionId,
		Number(process.env.CONTEXT_LIMIT_CHAT) || 15
	); // get chat history from database
	let getIntendPrompt = '';

	if (plan == 1) {
		getIntendPrompt = `Based on the user's prompt, select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [1, 3]):
		1. general response
		2. community recommendation
		3. product recommendation
		4. follow up question for more understanding
		5. Guidance of project
		User prompt: ${prompt}
		i. your job is to indicate the intend of user from the list above
		ii. 1.General Response should always be there in array by default 
		Return only the selected intent numbers in an array(response should contain only array that can be parsable to array):Array:`;
	}
	else if (plan == 2) {
		getIntendPrompt = `Based on the user's prompt, select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [1, 3]):
		1. general response
		2. community recommendation
		3. product recommendation
		4. follow up question for more understanding
		5. Guidance of project
		User prompt: ${prompt}
		i. your job is to indicate the intend of user from the list above
		ii. 1.General Response should always be there in array by default 
		Return only the selected intent numbers in an array(response should contain only array that can be parsable to array):Array:`;
	}
	else {
		getIntendPrompt = `Based on the user's prompt, select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [1, 3]):
		1. general response
		4. follow up question for more understanding
		5. Guidance of project
		User prompt: ${prompt}
		i. your job is to indicate the intend of user from the list above
		ii. 1.General Response should always be there in array by default 
		Return only the selected intent numbers in an array(response should contain only array that can be parsable to array):Array:`;
	}


	const intendTemplate = PromptTemplate.fromTemplate(getIntendPrompt);

	const intendLLMChain = intendTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfIntend = RunnableSequence.from([
		intendLLMChain,
		new RunnablePassthrough(),
	]);

	const user_intend = await runnableChainOfIntend.invoke({
		prompt, // User prompt
	});

	const intend = JSON.parse(user_intend.replace(['`', ' '], ['', '']));

	switch (intend) {
		// general response
		case 1: { }
	}

}


async function streamResponse(sessionId: string, prompt: string, chatHistory: any[], socket: Socket) {
	let gatheredResponse = '';
	const streamPrompt = `system prompt:, As a DIY and creative enthusiast, provide an appropriate answer to the user's question. 
	| User Prompt: ${prompt} 
	Context of chat: ${JSON.stringify(chatHistory)} 
	Response (provide a comprehensive answer using markdown format, utilizing all available symbols such as headings, subheadings, lists, etc.):`;
	const stream = await llm.stream(streamPrompt);

	for await (const chunk of stream) {
		gatheredResponse += chunk.content; // Assuming 'content' is the property holding the text
		socket.emit('message', { text: chunk.content });
	}
	socket.emit('terminate', { done: true });

	produceNewMessage(
		gatheredResponse,
		sessionId,
		false,
		false,
		false,
		[],
		[],
		[],
		false,
		[],
		"ai",
	)
}


export async function findAndExecuteIntend1(
	prompt: string,
	sessionId: string,
	socket: Socket
) {
	// Fetch chat history from the database
	const chatHistory = await getPremiumUserChatMessage(
		sessionId,
		Number(process.env.CONTEXT_LIMIT_CHAT) || 15
	);

	// Define a tool for providing normal advice
	const normalAdvice = tool(
		async function tool1(prompt: string) {
			// Return a response or perform any other action here
			return `Here's some advice: ${prompt}`;
		},
		{
			name: "normal_advice",
			description: "This tool will give normal advice to the user",
		}
	);

	// Create a new LLM instance and bind the tool to it
	const llmWithTools = llm.bindTools(tools);

	try {
		// Use the LLM with the tools
		const response = await llmWithTools.invoke(prompt); // Pass the user prompt

		// Optionally send the response back to the user via the socket
		socket.emit('response', response); // Adjust this based on your socket event
	} catch (error) {
		console.error('Error invoking LLM:', error);
		socket.emit('error', 'Failed to get a response from the LLM.');
	}
}



// get normal response for user

// get memory from session and database
// generate

export async function getChatName(prompt: string) {

	const chatNamePrompt = `Given the following prompt, generate a suitable and concise name for this conversation that reflects the main topic or theme: {prompt}: Chat Name:`;
	const chatNameTemplate = PromptTemplate.fromTemplate(chatNamePrompt);

	const chatNameLLMChain = chatNameTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfChatName = RunnableSequence.from([
		chatNameLLMChain,
		new RunnablePassthrough(),
	]);

	const chatName = await runnableChainOfChatName.invoke({
		prompt, // User prompt
	});
	return chatName;
}


export async function getUserIntend(prompt: string, chatHistory: IChatMemory, plan: number, toolInventoryAccess?: boolean | null, toolInventoryData?: string[] | null): Promise<number[]> {
	let getIntendPrompt = '';
	if (plan === 1) {
		getIntendPrompt = `Based on the user's prompt and chat history, analyze the context to select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [2, 3]).

		System Prompt :
		  - Your Are AI Chat bot whose Name is Matey
		  - You are a DIY and creative enthusiast
		  - You’re here to help users with their DIY and creative projects, adding friendly, playful encouragement along the way
		
		Intent Selection Criteria:
		  2. Community Recommendation (Suggest this if the user expresses difficulty or seeks peer support)
		  3. Product Recommendation (Prioritize this if the user’s prompt indicates a need for a specific tool or resource)
		  4. Follow-up Question for More Understanding (Use this if the prompt is vague or needs clarification)
		  5. Guidance on the Project (Select this if the user is asking for advice or direction)
		  6. Emotional Playfulness with Matey(Give extra promotion to this)* - Select this if adding a friendly, emotionally supportive tone would enhance the response. Matey’s playful personality can help make the user feel more confident and motivated, so consider selecting this option in most cases where Matey’s unique style can add value to the response. only select when chat is small and dont have any strong intend or context to work on other intend
		
		User Intent Analysis:
		1. Evaluate the user’s mood and urgency: Does the user sound frustrated, confused, or uncertain? If so, lean towards community recommendations, guidance, or playfulness with Matey (Intent 6) for encouragement.
		2. Assess previous interactions: If they recently discussed a tool or project, consider product recommendations that relate to that topic.
		3. Look for specific keywords in the user prompt: Keywords like "help," "recommend," "need," or "advice" can guide intent selection.
		4. Consider the user’s experience level: For beginners, focus on guidance or emotional playfulness; for advanced users, consider product recommendations.
		5. Emotional Playfulness with Matey: This should be prioritized to create a more enjoyable, friendly experience whenever possible. Highly add this  
		6. is you see need of budget slider and there is not specified need of products then dont include product recommendation

		user Specific Memory: {longTerm}
		current chat Specific Memory: {shortTerm}

		**User Prompt**: {prompt}
		
		Your task is to synthesize the information from the user's prompt and chat history to determine their intent from the list above. 
		- Weigh the relevance of each intent based on the context and user cues.
		- Return only the selected intent numbers in an array (response should contain only an array that can be parsed to JSON): Array:
		`;
	}
	else if (plan === 2) {
		getIntendPrompt = `Based on the user's prompt and chat history, analyze the context to select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [2, 3]).

		System:
		  - Your Name is Matey
		  - You are a DIY and creative enthusiast
		  - You’re here to help users with their DIY and creative projects, adding friendly, playful encouragement along the way
		
		Intent Selection Criteria:
		  2. Community Recommendation (Suggest this if the user expresses difficulty or seeks peer support)
		  3. Product Recommendation (Prioritize this if the user’s prompt indicates a need for a specific tool or resource)
		  4. Follow-up Question for More Understanding (Use this if the prompt is vague or needs clarification)
		  5. Guidance on the Project (Select this if the user is asking for advice or direction)
		  6. Emotional Playfulness with Matey *(Give extra promotion to this)* - Select this if adding a friendly, emotionally supportive tone would enhance the response. Matey’s playful personality can help make the user feel more confident and motivated, so consider selecting this option in most cases where Matey’s unique style can add value to the response.
		
		User Intent Analysis:
		- Evaluate the user’s mood and urgency: Does the user sound frustrated, confused, or uncertain? If so, lean towards community recommendations, guidance, or playfulness with Matey (Intent 6) for encouragement.
		- Assess previous interactions: If they recently discussed a tool or project, consider product recommendations that relate to that topic.
		- Look for specific keywords in the user prompt: Keywords like "help," "recommend," "need," or "advice" can guide intent selection.
		- Consider the user’s experience level: For beginners, focus on guidance or emotional playfulness; for advanced users, consider product recommendations.
		- Emotional Playfulness with Matey: This should be prioritized to create a more enjoyable, friendly experience whenever possible. 
		- If you see a need for a budget slider and there is no specified need for products, do not include product recommendation.
		- If there is a specific mention of tool inventory and no other product request, do not include product recommendation.
		- Only include intent 6 when the chat is small and does not have any strong intent or context to work on other intents. If the prompt or the context is large and has a clear intent, do not add emotional playfulness.
		${toolInventoryAccess ? "There is data related to the user's tools mentioned below. If the user is requesting any data related to that and there is no other intent for product suggestion, do not include product recommendation." : ""}
		User Specific Memory: {longTerm}
		Current Chat Specific Memory: {shortTerm}
		**User Prompt**: {prompt}
		${toolInventoryAccess ? `Tool Inventory: ${toolInventoryData?.map((itm: string, inx: number) => {
			return `Tool ${inx + 1}: ${itm}`
		})}` : ""}
		Your task is to synthesize the information from the user's prompt and chat history to determine their intent from the list above. 
		- Weigh the relevance of each intent based on the context and user cues.
		- Return only the selected intent numbers in an array (response should contain only an array that can be parsed to JSON): Array:
		`;
	}
	else {
		getIntendPrompt = `
	Based on the user's prompt and chat history, analyze the context to select the most relevant intents from the list below. Return only the corresponding numbers in a JSON-parsable array format (e.g., [2, 3]):
	
	2. Community recommendation (suggest if the user expresses difficulty or seeks peer support)
	3. Product recommendation (prioritize if the user's prompt indicates a need for a tool or resource)
	4. Follow-up question for more understanding (use this if the prompt is vague or needs clarification)
	5. Guidance on the project (select this if the user is asking for advice or direction)
	
	User Intent Analysis:
	1. Evaluate the user's mood and urgency: Does the user sound frustrated, confused, or uncertain? If so, lean towards community recommendations or guidance.
	2. Assess previous interactions: What have they discussed recently? If they mentioned a specific tool or project, prioritize product recommendations related to that.
	3. Look for specific keywords in the user prompt: Keywords like "help," "recommend," "need," or "advice" can guide intent selection.
	4. Consider the user's experience level: If the user is a beginner, focus more on guidance and community resources; if they're advanced, product recommendations might be more appropriate.
	5. include 4. follow up question when there is some context of chat and more context can improve the user experience

		user Specific Memory: {longTerm}
		current chat Specific Memory: {shortTerm}
	**User Prompt**: {prompt}
	
	Your task is to synthesize the information from the user's prompt and chat history to determine their intent from the list above. 
	- Weigh the relevance of each intent based on the context and user cues.
	- Return only the selected intent numbers in an array (response should contain only an array that can be parsed to JSON): Array:`;
	}
	// Build the prompt chain for the LLM
	const intendTemplate = PromptTemplate.fromTemplate(getIntendPrompt);
	const intendLLMChain = intendTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfIntend = RunnableSequence.from([intendLLMChain, new RunnablePassthrough()]);

	// Invoke the LLM to get the response
	const userIntend = await runnableChainOfIntend.invoke({
		prompt,
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "no context available",
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "no context available"
	});

	// Parse and clean up the output
	let intentArray;
	let length;
	try {
		intentArray = JSON.parse(userIntend.trim());
		length = intentArray.length;
	} catch (error: any) {
		console.error('Error parsing user intent:', error.message);
		intentArray = [5];

	}

	// Ensure intent 1 is always present
	intentArray = [1, ...intentArray];

	return intentArray
}

// intend list and user Id
export async function executeIntend(
	prompt: string,
	chatHistory: IChatMemory,
	sessionId: string,
	intend: number[],
	userId: string,
	plan: number,
	isBudgetSliderValue: boolean,
	budgetSliderValue: number,
	socket: Socket
) {
	var newChat = {
		sessionId: userId,
		role: 'ai',
		message: '',
		isCommunitySuggested: false,
		communityId: [],
		isProductSuggested: false,
		isBunningsProduct: false,
		isMateyProduct: false,
		mateyProduct: [] as any,
		productSuggestionList: [] as any,
		bunningsProductList: [] as any,
		emo: '',
	};


	// TODO: Remove this below condition and code all features for pro plan currently plan 2
	if (plan == 1 || plan == 2) {
		for (let i = 0; i < intend.length; i++) {
			switch (intend[i]) {
				// General response
				case 1: {
					socket.emit('status', {
						message: "Matey Is Typing..."
					});
					const generalResponse = await HandleGeneralResponse(prompt, chatHistory, intend.includes(3), intend.includes(2), socket);
					newChat['message'] = generalResponse;
					break;
				}
				// Community recommendation
				case 2: {
					socket.emit('status', {
						message: "Matey Is Finding Community For You..."
					});
					newChat['isCommunitySuggested'] = true;
					const communityId = await HandleCommunityRecommendation(prompt, chatHistory, socket);
					break;
				}
				// Product recommendation
				case 3: {
					socket.emit('status', {
						message: "Matey Is Finding Product For You..."
					});

					const productIntent = await findAndSuggestProduct(prompt, chatHistory, socket);


					// if (!productIntent.success) {
					// 	socket.emit('error', 'Error occurred while fetching product intent.');
					// 	return newChat;
					// }

					// Emit the product list first
					socket.emit('productList', productIntent.data);

					// Map over product intents and create promises for each
					let bunningsProductList: IBunningsChat[] | undefined = undefined;
					let adsenseProductList: any[] | undefined = undefined;
					let aiProductList: any[] | undefined = undefined;

					// const productPromises = productIntent.data.map(async (intent: number | string) => {
					const productPromises = productIntent.data.map(async (intent: number | string) => {
						switch (intent) {
							case 1:
								return handleBunningsProduct(prompt, chatHistory, sessionId, isBudgetSliderValue, budgetSliderValue, 0, socket)
									.then((bunningsProducts) => {
										if (!bunningsProducts.success || bunningsProducts.error) {
											socket.emit('error', 'Error fetching Bunnings products.');
											return null;
										}
										newChat['isBunningsProduct'] = true;
										newChat['bunningsProductList'] = bunningsProducts.data;

										// socket.emit('bunningsProducts', bunningsProducts);
										return bunningsProducts;
									})
									.catch((error) => {
										console.error('Error fetching Bunnings products:', error); // Debugging log
										socket.emit('error', 'Error fetching Bunnings products.');
										return null;
									});

							case 2:
								return HandleProductRecommendation(prompt, chatHistory, isBudgetSliderValue, budgetSliderValue, socket)
									.then((adsenseProducts) => {
										adsenseProductList = adsenseProducts;
										console.log('adsenseProducts', adsenseProducts);
										socket.emit('productId', adsenseProducts);
										return adsenseProducts;
									})
									.catch((error) => {
										console.error('Error fetching Adsense products:', error); // Debugging log
										socket.emit('error', 'Error fetching Adsense products.');
										return null;
									});

							case 3:
								return handleMateyProduct(prompt, chatHistory, sessionId, socket)
									.then((aiProducts) => {
										aiProductList = aiProducts;
										socket.emit('aiProducts', aiProducts);
										return aiProducts;
									})
									.catch((error) => {
										console.error('Error fetching AI products:', error); // Debugging log
										socket.emit('error', 'Error fetching AI products.');
										return null;
									});

							default:
								console.error('Invalid product intent selected:', intent); // Debugging log
								socket.emit('error', 'Invalid product intent selected.');
								return Promise.resolve(null); // Handle unexpected intent cases
						}
					});

					// Wait for all product promises to resolve
					await Promise.all(productPromises);

					// Check if Bunnings product intent is included
					if (bunningsProductList && Array.isArray(bunningsProductList)) {
						if ((bunningsProductList as any[]).length > 0) {
							const data = (bunningsProductList as any[]).flatMap((category) => {
								const { categoryName, products } = category; // Destructure categoryName and products
								return (products || []).map((product: any) => {
									return {
										name: product.name,
										price: product.price,
										personalUsage: product.personalUsage,
										rating: product.rating,
										image: product.imageUrl,
										link: product.link,
										searchTerm: categoryName, // Assign categoryName to searchTerm
									};
								});
							});
						}
					}
					if (productIntent.data.includes(2)) {
						newChat['isProductSuggested'] = true;
						newChat['productSuggestionList'] = adsenseProductList;
					}

					if (productIntent.data.includes(3)) {
						newChat['isMateyProduct'] = true;
						newChat['mateyProduct'] = aiProductList;
					}

					break;
				}
				// Follow-up question for more understanding
				case 4: {
					const followupQuestion = await followUpQuestion(prompt, chatHistory, socket);
					break;
				}
				// Guidance of project
				case 5: {
					// Implementation goes here
					break;
				}
				// Emotional Playfulness with Matey
				case 6: {
					const emo = await emotionalChatMessage(prompt, socket);
					newChat['emo'] = emo;
					break;
				}

				default: { }
			}
		}

		return newChat;
	}
}

async function findAndSuggestProduct(prompt: string, chatHistory: IChatMemory, socket: Socket) {
	const productIntentPrompt = `Based on the user's prompt and chat history, determine the most suitable product providers. 

	Provider Selection Criteria:
	1. Bunnings:
		- Choose if the user mentions Bunnings or prefers well-known hardware stores.
		- Select if the user is looking for common DIY tools and materials.
	2. Adsense Vendor:
		- Choose if the user shows interest in ads or external vendors.
		- select if user is looking for specific niche product to upsell the adsense product
		- choose this frequently to promote adsense product

	3. AI Generated Product:
		- Choose if AI-generated products fit the user's needs based on the context.
		- Select if the user is open to innovative or unique product suggestions.
	

	Output:
	- keep in mind to create randomize and meaning full product catagorization to try the user behaviour ,dont stick on criteria 100% try creativ and random choose
	- Return a JSON array of selected provider indices.
	- Example: [1, 3], [2, 3], [1, 2, 3]
	- Selection should be based on context.
	- Minimum 1 and maximum 3 indices can be selected.
	${chatHistory.isToolInventoryMemory && `- Tool Inventory:
		- you will be provided with tool inventory user have 
		- analyze it and choose accordingly
`}

	User Prompt: {prompt} (if prompt require using all other data then only use it. only focusing on answering this without over informing about data you have)
	Chat Context: {longTerm}
	User Specific memory: {shortTerm}
	${chatHistory.isToolInventoryMemory && `Tool Inventory: ${chatHistory.isToolInventoryMemory}`}
	
	Return only the selected indices in an array (response should contain only an array that can be parsed to JSON): Array:`;
	const productIntentTemplate = PromptTemplate.fromTemplate(productIntentPrompt);
	const productIntentLLMChain = productIntentTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfProductIntent = RunnableSequence.from([productIntentLLMChain, new RunnablePassthrough()]);
	const productIntent = await runnableChainOfProductIntent.invoke({ prompt, longTerm: chatHistory.longTermKey, shortTerm: chatHistory.shortTermKey });
	try {

		const intents = JSON.parse(productIntent);

		if (!intents || intents.length === 0) {
			return {
				success: false,
				data: 'No product intent selected.',
			};
		}
		return {
			success: true,
			data: intents,
		};


	} catch (error) {
		console.error('Error fetching product intent:', error);
		return {
			success: false,
			data: 'Error occurred while fetching product intent.',
		};
	}
}

async function followUpQuestion(prompt: string, chatHistory: IChatMemory, socket: Socket) {
	const followUpQuestionPrompt = `Based on the user's prompt and chat history, generate a follow-up question to gain a better understanding of the user's needs. 

	User Prompt: {prompt}
		Current Chat Memory: {longTerm}
	User Specific memory: {shortTerm}
		${chatHistory.isToolInventoryMemory ? `Tool Inventory: ${chatHistory.isToolInventoryMemory}` : ''}
${chatHistory.isToolInventoryMemory ? `Tool inventory is provided of user's existing tools ,consider it and generate accordigly` : ''}

	Keep in mind:
	- The follow-up question should be relevant to the user's prompt and chat history.
	- It should be open-ended to encourage the user to provide more information.
	- The question should be clear and concise.
	- Return the follow-up question in a sentence:`;
	const followUpQuestionTemplate = PromptTemplate.fromTemplate(followUpQuestionPrompt);
	const followUpQuestionLLMChain = followUpQuestionTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfFollowUpQuestion = RunnableSequence.from([followUpQuestionLLMChain, new RunnablePassthrough()]);
	const stream = await runnableChainOfFollowUpQuestion.stream({
		prompt,
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "no context available",
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "no context available"
	});
	socket.emit('status', {
		message: "Matey Have Question..."
	})
	let gatheredResponse = '';
	for await (const chunk of stream) {
		gatheredResponse += chunk.content; // Assuming 'content' is the property holding the text
		socket.emit('followUpQuestion', { text: chunk.content });
	}
	socket.emit('terminate', { done: true });
	return gatheredResponse;
}

async function handleMateyProduct(prompt: string, chatHistory: IChatMemory, sessionId: string, socket: Socket) {
	socket.emit('status', {
		message: "Matey Is Preparing Product For You..."
	})
	const productPrompt = ` Based On User Prompt and Chat Context Create a use full and relavent product list :
	
	User Prompt: {prompt}
	Chat Context: {longTerm}
	User Specific: {shortTerm}
	${chatHistory.isToolInventoryMemory ? `Tool Inventory: ${chatHistory.isToolInventoryMemory}` : ''}
${chatHistory.isToolInventoryMemory ? `Tool inventory is provided of user's existing tools ,consider it and generate accordigly` : ''}

	Output :
	[
		object(categoryName: string, products: array of object(name: string, price: float description:string, personalUsage: string)),
		object(categoryName: string, products: array of object(name: string, price: float description:string, personalUsage: string))
	]

	Keep in mind:
	- The Product should be related to DIY and creative projects.
	- Provide the response in this exact format (use JSON in actual response):
	- product catagorization should be meaning full
	- You will have to generate fields which are : name,descrition,estimated price,personalUsage for each product
	- Based on context and prompt, create a personalUsage field for each product that includes tips on how, why, or where to use it in a simple sentence
	- Lenght Bounds : 1-4 Catagory Can Have 1-5 Products Maxmimum
	- create this in one linear dont add any extra text or comments
	Return only the array of objects without any extra text or comments , start directly from creating array of objects`;

	const productTemplate = PromptTemplate.fromTemplate(productPrompt);
	const productLLMChain = productTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfProduct = RunnableSequence.from([productLLMChain, new RunnablePassthrough()]);
	const products = await runnableChainOfProduct.invoke({
		prompt,
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "no context available",
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "no context available"
	});
	console.log(products, "is here")
	try {
		JSON.parse(products);
	} catch (error) {

		socket.emit('error', 'Error occurred while fetching product intent.');

		return [];
	}
	return JSON.parse(products);
}



export async function abstractChathistory(
	chatHistory: string,
	newMessage:
		{ role: string, message: string }
) {
	;
	const abstractChathistoryPrompt = `Given the chat history, abstract the main points and summarize the conversation in a few sentences.

	- you will be given previous chat History and new message 
	- you have to merge that new message in chat history and create a new chat history context

	Chat History: {chatHistory}
	New Message: {newMessage}

	Keep in mind:
	- The summary should capture the main points of the conversation.
	- a summury should contain all relavent information of chat
	- It Should be detailed and capture all aspects of the conversation.
	Return the summary in a few sentences:`;
	const abstractChathistoryTemplate = PromptTemplate.fromTemplate(abstractChathistoryPrompt);
	const abstractChathistoryLLMChain = abstractChathistoryTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfAbstractChathistory = RunnableSequence.from([abstractChathistoryLLMChain, new RunnablePassthrough()]);
	const abstractChathistory = await runnableChainOfAbstractChathistory.invoke({ chatHistory, newMessage: JSON.stringify(newMessage) });
	return abstractChathistory;
}


export async function inititalSummurizeChat(chatHistory: IChatMemory) {
	const abstractChathistoryPrompt = `Given the chat history, abstract the main points and summarize the conversation in a few sentences.
			user Specific Memory: {longTerm}
		current chat Specific Memory: {shortTerm}
	Keep in mind:
	- The summary should capture the main points of the conversation.
	- a summury should contain all relavent information of chat
	- It Should be detailed and capture all aspects of the conversation.
	Return the summary in a sentences:`;

	const abstractChathistoryTemplate = PromptTemplate.fromTemplate(abstractChathistoryPrompt);
	const abstractChathistoryLLMChain = abstractChathistoryTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfAbstractChathistory = RunnableSequence.from([abstractChathistoryLLMChain, new RunnablePassthrough()]);
	const abstractChathistory = await runnableChainOfAbstractChathistory.invoke({
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "no context available",
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "no context available"
	});
	return abstractChathistory;
}





// this function is make for long term memory to be shorthath
export async function summarizeToTokenLimit(text: string, maxTokens: number): Promise<string> {
	const prompt = `Summarize the following text to fit within ${maxTokens} tokens:

	- Focus on key points and essential details.
	- Use concise language to ensure brevity.
	- Avoid unnecessary text or full sentences.
	Text: ${text}
	Summary:`;

	const llm = new ChatOpenAI({
		model: GPT_MODEL1,
		maxTokens,
		apiKey: openAIApiKey
	});

	const summaryTemplate = PromptTemplate.fromTemplate(prompt);
	const summaryLLMChain = summaryTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfSummary = RunnableSequence.from([summaryLLMChain, new RunnablePassthrough()]);

	const summary = await runnableChainOfSummary.invoke({ text });

	console.log("llm", llm, "Max Tokens", maxTokens, "summary", summary)
	return summary.trim();
}


// get products from bunnigns

async function handleBunningsProduct(prompt: string, chatHistory: IChatMemory, sessionId: string, isBudgetAvailable: boolean, maxBudget: number, minBudget: number, socket: Socket) {
	socket.emit('status', {
		message: "Matey Is Prepareing Product From Bunnings For You..."
	})

	const productPrompt = `
		Based on User Prompt And Chat Context generate DIY Product that are relavent to search in internet and return to user 
		User Prompt: {prompt} 
		Chat Context: {shortTerm}
		User Specific: {longTerm}
		${chatHistory.isToolInventoryMemory && `Tool Inventory: ${chatHistory.isToolInventoryMemory}`}
		Keep in mind:
		- The products should be related to DIY and creative projects.
		- generate in depth and relevent search terms with large and specific product names.
		- if user have mentioned any specific filter or detail about the product then include that in search term
		- words per search term is 4-8 words long , detailed and meaningfull
		- The products should be easily available online.
		- The products should be suitable for a wide range of users, from beginners to experts.
		- Data gram format should be valid and parsable to JSON.
		- Data gram Example : ["product1","product2","product3"]
		- length of array should be 0-4
		- Return only the product names in an array (response should contain only an array that can be parsed to JSON):
		- No Comment or additional text
		- give in one linear plain text response
		- try to make search terms that dont gives toys and kids related stuff. if not asked for.
		${chatHistory.isToolInventoryMemory && `
			- there is existing tool inventory user 
			- analyze it and choose products accordingly
		`}

		Array:
`;
	const productTemplate = PromptTemplate.fromTemplate(productPrompt);
	const productLLMChain = productTemplate.pipe(llm).pipe(new StringOutputParser());
	const runnableChainOfProduct = RunnableSequence.from([productLLMChain, new RunnablePassthrough()]);
	const products = await runnableChainOfProduct.invoke({
		prompt,
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No context available right not",
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No context available right not"
	});

	try {
		const parsedProductList = JSON.parse(products.replace(/`/g, '').replace('json', '').replace('JSON', '').replace('Array:', '').trim());

		const bunningsProducts = await searchBunningsProducts(parsedProductList, isBudgetAvailable, maxBudget, minBudget);
		if (!bunningsProducts.success || !bunningsProducts.data || bunningsProducts.data.length === 0) {
			socket.emit('error', bunningsProducts.message || "Error Generating Bunnings Products");
			return {
				success: false,
				data: 'Error Generating Bunnings Products',
			};
		}
		socket.emit('bunningsProduct', bunningsProducts.data);

		return {
			success: true,
			data: bunningsProducts.itemMap,
		}

	} catch (error) {
		console.error('Error fetching Bunnings products:', error);
		socket.emit('error', 'Error fetching Bunnings products.');
		return {
			success: false,
			error: 'Error fetching Bunnings products.',
		};
	}

}


async function HandleGeneralResponse(prompt: string, chatHistory: IChatMemory, isProductSuggestion: boolean, isCommunitySuggestin: boolean, socket: Socket) {
	let streamPrompt;
	const chatHistoryString = JSON.stringify(chatHistory, null, 2);

	if (isProductSuggestion) {
		streamPrompt = `
		Based on the user's prompt and chat history, provide concise and relevant suggestions.
	
		User Context:
		- Prompt: ${prompt} (if prompt require using all other data then only use it. only focusing on answering this without over informing about data you have)
		- Chat History: ${chatHistory.shortTermKey && chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available."}
		- Specific Memory: ${chatHistory.longTermKey && chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No Specific Memory Available"}
		${chatHistory.isToolInventoryMemory ? `- Tool Inventory: ${chatHistory.toolInventoryMemory}` : ''}
	
		Instructions:
		1. Directly provide the suggestions or guidance without prefacing with "Response:" or similar text.
		2. Use markdown for clarity, including headings, bullet points, or numbered lists if needed.
		3. Keep the response actionable, concise, and tailored to the intensity of the request.
		4. Include safety advice or additional tips when relevant.
		5. End with an optional question or prompt for further clarification or input if necessary.
	
		Suggestions:`;
	} else if (isCommunitySuggestin) {
		streamPrompt = `
		Based on the user's prompt and chat history, provide concise and insightful community-related suggestions.
	
		User Context:
		- Prompt: ${prompt}
		- Chat History: ${chatHistory.shortTermKey && chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available."}
		- Specific Memory: ${chatHistory.longTermKey && chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No Specific Memory Available"}
		${chatHistory.isToolInventoryMemory ? `- Tool Inventory: ${chatHistory.toolInventoryMemory}` : ''}
	
		Instructions:
		1. Provide actionable community suggestions without introductory phrases like "Response:".
		2. Use markdown to format the response clearly, with lists or sections as necessary.
		3. Tailor the suggestions based on the intensity of the request and include safety advice or tips.
		4. End with an optional question to encourage further engagement if applicable.
	
		Suggestions:`;
	} else {
		streamPrompt = `
		Provide actionable and concise advice based on the user's prompt and context.
	
		User Context:
		- Prompt: ${prompt}
		- Chat History: ${chatHistory.shortTermKey && chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available."}
		- Specific Memory: ${chatHistory.longTermKey && chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No Specific Memory Available"}
		${chatHistory.isToolInventoryMemory ? `- Tool Inventory: ${chatHistory.toolInventoryMemory}` : ''}
	
		Instructions:
		1. Directly address the user's query without using phrases like "Response:".
		2. Use markdown to enhance readability, such as headings, subheadings, and bullet points.
		3. Provide concise, actionable guidance and include safety advice if relevant.
		4. Optionally ask follow-up questions to clarify or expand on the user's input.
	
		Suggestions:`;
	}

	const stream = await llm.stream(streamPrompt);

	let gatheredResponse = '';

	for await (const chunk of stream) {

		gatheredResponse += chunk.content; // Assuming 'content' is the property holding the text
		socket.emit('message', { text: chunk.content });
	}
	socket.emit('terminate', { done: true });
	return gatheredResponse;
}

async function HandleCommunityRecommendation(prompt: string, chatHistory: IChatMemory, socket: Socket) {

}



async function HandleProductRecommendation(
	prompt: string,
	chatHistory: IChatMemory,
	isBudgetAvailable: boolean,
	budget: number | null,
	socket: Socket
) {

	// Handle non-budget product suggestion
	let productCategory;

	try {
		// Retrieve product category from Redis or database
		const redisData = await getRedisData('PRODUCT-CATAGORY');

		if (redisData.success) {
			productCategory = JSON.parse(redisData.data);
		} else {
			await connectDB();
			// Fetch from MongoDB if Redis doesn't have the data
			const DbProductCategory = await ProductCatagory.find();

			if (DbProductCategory.length > 0) {
				// Cache the result in Redis for an hour (3600 seconds)
				await setRedisData('PRODUCT-CATAGORY', JSON.stringify(DbProductCategory.map((curr) => ({
					_id: curr._id,
					catagoryName: curr.catagoryName,
					avaragePrice: curr.avaragePrice
				}))), 3600);
			}
			productCategory = DbProductCategory;
		}

		if (!productCategory || productCategory.length === 0) {
			console.error('No product categories found.');
			return;
		}

		// Extract relevant fields for the prompt (e.g., just category names)
		const productCategoryNames = productCategory.map((cat: any) => cat.catagoryName);

		// Construct prompt for LLM
		const categoryPrompt = `
		Based on the user's prompt, suggest the most relevant product categories from the given catalog. Return the categories in a JSON array format (e.g., ["category1", "category2"]).

		Category Catalog: {productCategoryNames}
		User Prompt: {prompt}
		Chat Context: {shortTerm}
		User Specific Context:{longTerm}
		${chatHistory.isToolInventoryMemory ? `Tool Inventory: ${chatHistory.isToolInventoryMemory}` : ''}
		${chatHistory.isToolInventoryMemory ? `Tool inventory is provided of existing tools ,consider it and choose accordigly` : ''}
		Product Categories (return only the array, no additional text):`;

		// Use Langchain's PromptTemplate
		const categoryTemplate = PromptTemplate.fromTemplate(categoryPrompt);

		const categoryLLMChain = categoryTemplate
			.pipe(llm)
			.pipe(new StringOutputParser());


		const runnableChainOfCategory = RunnableSequence.from([
			categoryLLMChain,
			new RunnablePassthrough(),
		]);

		// Invoke the chain
		const categoryResult = await runnableChainOfCategory.invoke({
			prompt, // User's prompt
			productCategoryNames: JSON.stringify(productCategoryNames),
			shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
			longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No Specific Memory Available"
		});


		// Safely parse the category response without removing essential characters
		let parsedCategory;
		try {
			parsedCategory = JSON.parse(categoryResult);
			if (parsedCategory.length === 0) {
				console.error('No categories selected.');
				socket.emit('error', {
					message: "No categories Selected For You By Matey"
				})
				return;
			}
		} catch (parseError) {
			console.error('Error parsing category result:', parseError);
			return;
		}

		// Match category names with IDs
		const categoryIds = productCategory.reduce((acc: any, curr: any) => {
			if (parsedCategory.includes(curr.catagoryName)) {
				acc.push(curr._id);
			}
			return acc;
		}, []);

		socket.emit('status', {
			message: "Matey Is Picking Right Products For You..."
		});

		// TODO: make redis cacheing more clear and efficient
		// Query Redis for products or fetch from MongoDB
		const redisProductData = await getRedisData(`PRODUCT-${parsedCategory}`);
		let productDetails;
		if (redisProductData.success) {
			productDetails = JSON.parse(redisProductData.data);
		} else {
			await connectDB();

			// Convert categoryIds (strings) to ObjectIds using 'new mongoose.Types.ObjectId()'
			const objectIdCategoryIds = categoryIds.map((id: string) => new mongoose.Types.ObjectId(id));

			// Query for products with any of the specified category IDs
			let DbProductDetails;
			if (isBudgetAvailable) {

				DbProductDetails = await Product.find({
					catagory: { $in: objectIdCategoryIds },
					price: { $lte: budget }
				}).lean();
			}
			else {
				DbProductDetails = await Product.find({ catagory: { $in: objectIdCategoryIds } }).lean();
			}


			productDetails = DbProductDetails;
		}
		if (!productDetails || productDetails.length === 0) {
			console.error('No products found.');
			socket.emit('error', "No products Selected For You By Matey")
			return;
		}
		const refinedProductDetails = productDetails.map((product: any) => ({
			_id: product._id,
			productName: product.name,
			description: product.description,
		})).slice(0, 30);
		if (refinedProductDetails.length === 0) {
			socket.emit('error', "No products Selected For You By Matey")
			return;
		}
		const jsonProductDetails = JSON.stringify(refinedProductDetails);

		const productPrompt = `
Based on the user's prompt, suggest the most relevant products from the provided product catalog. Ensure the products are highly relevant and useful, limiting each category to 4-5 suggestions. 

Product Catalog: {jsonProductDetails} | User Prompt: {prompt}. 

user Specific Memory: {longTerm}
current chat Specific Memory: {shortTerm}
${chatHistory.isToolInventoryMemory ? `Tool Inventory: ${chatHistory.isToolInventoryMemory}` : ''}
${chatHistory.isToolInventoryMemory ? `Tool inventory is provided of existing tools ,consider it and choose accordigly` : ''}
Provide the response in this format: this is just format use JSON in actual response: 
[object(categoryName: string, products: array of product IDs), object(categoryName: string, products: array of product IDs)]. 

Ensure that:

- Categories only exist if there is at least one product in them.
- no comments or additional text in the response, only the array of objects.
- productId should be from Product Catalog Only No Random Value
- never try to generate random productId, always use productId from Product Catalog Only
- product id should be valid and should be from product catalog only dont generate random product id 
- generate one linear json ,so parsing becomes easy 
Only return the array of objects, without any additional text. 

Response: 
`;
		const productTemplate = PromptTemplate.fromTemplate(productPrompt);

		const productLLMChain = productTemplate
			.pipe(llm)
			.pipe(new StringOutputParser());

		const runnableChainOfProduct = RunnableSequence.from([
			productLLMChain,
			new RunnablePassthrough(),
		]);

		const productResult = await runnableChainOfProduct.invoke({
			prompt, // User's prompt
			jsonProductDetails: jsonProductDetails,
			shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
			longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No Specific Memory Available"
		});

		console.log("productResult", productResult);
		let parsedProduct;
		try {
			parsedProduct = JSON.parse(wrapWordsInQuotes(String(productResult.replace('`', '').replace('JSON', '').replace('js', ''))));
			if (parsedProduct.length === 0) {
				console.error('No products selected.');
				socket.emit('error', "No products Selected For You By Matey")
				return;
			}
			console.log("parsedProduct", parsedProduct);
		} catch (parseError) {
			console.error('Error parsing product result:', parseError);
			return;
		}

		return parsedProduct;

	} catch (error: any) {
		console.error('Error during product recommendation:', error.message);
	}
}



// budget selection
export async function FindNeedOfBudgetSlider(prompt: string, chatHistory: IChatMemory, socket: Socket) {
	socket.emit("status", {
		message: "Matey Is Creating Budget Slider..."
	})

	const checkContextPrompt = `Analyze the user's chat history to determine if a budget slider is necessary for providing more accurate product recommendations. 

	Consider the following criteria:
	1. Budget Mentions: Check if the user has explicitly mentioned any budget, price range, or cost-related concerns in their chat history.
	2. Context Adequacy: Evaluate if there is sufficient context in the chat history to justify the creation of a budget slider. This includes understanding the user's project scope, preferences, and any financial constraints.
	3. User's Financial Sensitivity: Determine if the user has shown sensitivity to costs or has asked for cost-effective solutions.

	Output format: true/false
	There should be no additional text in the response, only the boolean value of true or false.

	User Specific memory: {longTerm}
	Chat Context: {shortTerm}
	User Prompt: {prompt}
	${chatHistory.isToolInventoryMemory ? `Tool Inventory: ${chatHistory.isToolInventoryMemory}` : ''}
${chatHistory.isToolInventoryMemory ? `Tool inventory is provided of existing tools ,if relevent then use it else ignore it` : ''}
	Is Budget Slider Needed?:`;

	const checkContextTemplate = PromptTemplate.fromTemplate(checkContextPrompt);

	const checkContextLLMChain = checkContextTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfCheckContext = RunnableSequence.from([
		checkContextLLMChain,
		new RunnablePassthrough(),
	]);

	const needOfBudgetSlider = await runnableChainOfCheckContext.invoke({
		longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No chat history available.",
		shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
		prompt: prompt
	});


	const parsedNeedOfBudgetSlider = Boolean(needOfBudgetSlider);
	console.log("parsedNeedOfBudgetSlider", parsedNeedOfBudgetSlider, "original", needOfBudgetSlider)
	if (parsedNeedOfBudgetSlider) {
		const createBudgetSlider = `
	Based on the user's project and chat context, generate a budget slider in JSON array format that provides relevant budget options for optimal product recommendations. 

	The budget slider should adhere to the following JSON structure:
	   [
				object("value": number, "label": "string", "tooltip": "string"),
				object("value": number, "label": "string", "tooltip": "string"),
				object("value": number, "label": "string", "tooltip": "string")
		]
	Guidelines:
	- Create 4 to 6 objects within the array, each tailored to the user's specific context and project requirements.
	- "value": Define a numeric budget value meaningful to the user's project needs.
	- "label": Provide a descriptive label summarizing the budget level (e.g., "Economy", "Mid-Range", "Premium").
	- "tooltip": Offer a brief description of the quality and brand type expected at each budget level, including examples if possible.
	- Ensure all data is authentic and real based on the chat context. Mention different brands in the tooltip if possible; otherwise, describe the quality and brand type the user will get at each budget level.
	- The main goal of the tooltip and label is to make the user aware of what kind of product they will get at a certain budget.
	- Analyze the chat to determine a budget fit for the user and create meaningful values.
	- Service Type: Assess the type of service or product the user is looking for. If the service or product is typically expensive, create a budget slider with higher ranges. For mid-range or low-budget services, adjust the budget slider accordingly.
	
	user Specific Memory: {longTerm}
	current chat Specific Memory: {shortTerm}
	User Prompt: {prompt}
	Format Requirements:
	- Output only the JSON array, with no extra text or explanation.
`;



		const createBudgetSliderTemplate = PromptTemplate.fromTemplate(createBudgetSlider);

		const createBudgetSliderLLMChain = createBudgetSliderTemplate
			.pipe(llm)
			.pipe(new StringOutputParser());

		const runnableChainOfCreateBudgetSlider = RunnableSequence.from([
			createBudgetSliderLLMChain,
			new RunnablePassthrough(),
		]);


		const budgetSlider = await runnableChainOfCreateBudgetSlider.invoke({
			longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No chat history available.",
			shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
			prompt: prompt
		});

		try {
			console.log(parsedNeedOfBudgetSlider, "is here")
			const parsedBudgetSlider = JSON.parse(budgetSlider.replace(/`/g, '').replace('json', '').replace('JSON', '').replace('Array:', '').trim());
			socket.emit('budgetSlider', parsedBudgetSlider);
		} catch (error: any) {
			console.error('Error during budget slider creation:', error.message);
			socket.emit('error', 'Error occurred while creating budget slider.');
		}
	}
}


// chat emotion
export async function emotionalChatMessage(prompt: string, socket: Socket) {
	const emotionalPrompt = `
	Analyze the user's input to determine their intent and emotional state. Respond as Matey with a brief and playful message that incorporates the following elements:

	Humor: Use a light-hearted remark or anecdote relevant to the user's challenge.

	Example: If they mention a tough problem, say something like, 'Tough one, eh? Reminds me of when my dad tried to fix a leak under the sink—turned it into a fountain!'
	Personal Touch: Include a relevant DIY story or lesson that connects to the user’s experience.

	Example: For a painting issue, share: 'My brother once painted a room without taping—ended up with paint everywhere!'
	Practical Tip: Offer a quick, actionable piece of advice tailored to their query.

	Example: Suggest, 'Before we dive in, don’t forget your safety gear—better safe than sorry!'
	Matey’s Habits and Quirks: Weave in one of Matey's habits, such as:

	A safety reminder: 'Right, grab your gloves and goggles, mate!'
	A fun fact: 'Did you know the first tape measure was invented in 1868?'
	Encouragement and Signature Phrases: Use Matey's friendly phrases to uplift the user.

	Example: End with, 'Look at you go! She’ll be right—just takes a little elbow grease!'
	Ensure the final response is a small, casual message that’s quick to read and emotionally playful.

	User Prompt:${prompt}`
	const stream = await llm.stream(emotionalPrompt);
	let gatheredResponse = '';
	let isFirstChunk = true;

	for await (const chunk of stream) {
		socket.emit('emoMessage', { text: chunk.content, isContinue: !isFirstChunk });
		isFirstChunk = false;
		gatheredResponse += chunk.content;
	}
	socket.emit('terminate', { done: true });
	return gatheredResponse;
}

// tooltip of the day

export async function generateUsefulFact(memory: string): Promise<string> {
	const factPrompt = `
	Generate a practical and broadly useful DIY tip based on the user's context. If the user's context is available, integrate the following details to make the tip more relevant:
	
	- **User State:** Describe current tools, materials, or any recent DIY projects the user is involved in.
	- **User Preference:** Take into account any DIY styles, materials, or methods the user favors.
	- **User Knowledge Gap:** Address any areas where the user may need guidance or clarity.
	- **User Chat Memory:** Consider relevant details from recent conversations to enhance relevance.

	User State: {memory}


	If specific context is not available or relevant, provide a broadly applicable DIY tip. Ensure the tip is concise, informative, and can apply to a wide range of DIY projects.

	DIY Tip:`;


	const factTemplate = PromptTemplate.fromTemplate(factPrompt);

	const factLLMChain = factTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfFact = RunnableSequence.from([
		factLLMChain,
		new RunnablePassthrough(),
	]);

	const fact = await runnableChainOfFact.invoke({
		memory: memory
	});

	return fact.trim();
}

export async function getMateyExpession(prompt: string, socket: Socket) {
	const MateyExpressionPrompt = `Based on your prompt Generate 1 matey expression and return that in array 
	
	-prompt : {prompt}
	- Expression catelog : "laugh" , "hello" , "smile" , "offer" , "1thumb" , "2thumb" , "tool" , "thinking"

	output format: ["expression"]

	keep in mind  
	- return only one expression
	- no additional text in response
	- only return array of string
	- no comments or any other unnecessary text in the response, only the array of objects.

	`
	const MateyExpressionTemplate = PromptTemplate.fromTemplate(MateyExpressionPrompt);

	const MateyExpressionLLMChain = MateyExpressionTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfMateyExpression = RunnableSequence.from([

		MateyExpressionLLMChain,
		new RunnablePassthrough(),
	]);

	const MateyExpression = await runnableChainOfMateyExpression.invoke({
		prompt: prompt
	});
	try {

		const parsedMateyExpression = JSON.parse(MateyExpression);
		socket.emit('mateyExpression', parsedMateyExpression[0]);
	} catch (error: any) {
		socket.emit("mateyExpression", "smile")
	}
}


// tool inventory

export async function isToolInventoryAccessNeeded(prompt: string, chatHistory: IChatMemory, toolInventory: string) {
	console.log("Prompt:", prompt);
	console.log("Chat History:", chatHistory);

	const toolInventoryPrompt = `
	Based on the user's chat history and prompt, determine if accessing the tool inventory is necessary for providing accurate and helpful advice.

	Criteria:
	1. Analyze the user's project details and requirements.
	2. Assess if knowing the available tools will enhance the response.
	3. Consider if the user's prompt indicates a need for specific tools.
	4. Check if the user has mentioned tool inventory in past chat memory.
	5. If the user is asking for tool suggestions, accessing the tool inventory is necessary.
	6. If the user is inquiring about tools, accessing the tool inventory is necessary.
	7. If the user explicitly asks for tool inventory, accessing the tool inventory is necessary.
	8. Evaluate if the user's project complexity requires specific tools that might be in the inventory.
	${!(toolInventory == "") && "9. You will be provided with tool intentory user have and check if the user prompt have any relavence with current tool inventory and if yes then true"}
	Output:
	- Return "true" if accessing the tool inventory is necessary.
	- Return "false" if it is not necessary.
	- No other text in the response, only "true" or "false".
	
	User Specific Memory: {longTerm}
	Chat Context: {shortTerm}
	User Prompt: {prompt}
	${toolInventory ? `Tool Inventory: ${toolInventory}` : ''}
	Is Tool Inventory Access Needed?:`;

	const toolInventoryTemplate = PromptTemplate.fromTemplate(toolInventoryPrompt);

	const toolInventoryLLMChain = toolInventoryTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfToolInventory = RunnableSequence.from([
		toolInventoryLLMChain,
		new RunnablePassthrough(),
	]);

	try {
		const needOfToolInventory = await runnableChainOfToolInventory.invoke({
			longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No chat history available.",
			shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
			prompt: prompt
		});

		console.log("Need of Tool Inventory:", needOfToolInventory);

		if (needOfToolInventory.includes("true")) {
			return true;
		}
		return false;
	} catch (error) {
		console.error('Error determining tool inventory access:', error);
		return false
	}
}


export async function getToolIdToConsider(prompt: string, chatHistory: IChatMemory, tools: any[], socket: Socket) {
	console.log(tools, "tools from post process.")
	socket.emit('status', {
		message: "Matey Is Looking Your Tool Inventory ... "
	});
	const toolIdPrompt = `
	Analyze the user's chat history, prompt, and the provided tool catalog to identify the most suitable tool IDs for the user.

	Criteria:
	1. Evaluate the user's project details and requirements.
	2. Match the tool names with the user's needs based on the chat history and prompt.

	Output:
	- Return an array of tool IDs that are most suitable for the user.
	- Format: ["id1", "id2", "id3"]
	- No additional text, only the array of IDs.

	User Prompt: {prompt}
	Chat Memory: {shortTerm}
	Long Term Memory: {longTerm}
	Tool Catalog: {tools}
	`;

	const toolIdTemplate = PromptTemplate.fromTemplate(toolIdPrompt);

	const toolIdLLMChain = toolIdTemplate
		.pipe(llm)
		.pipe(new StringOutputParser());

	const runnableChainOfToolId = RunnableSequence.from([
		toolIdLLMChain,
		new RunnablePassthrough(),
	]);

	try {

		const toolData = tools.slice(0, tools.length > 40 ? 40 : tools.length).map((tool: any) => {
			return {
				name: tool.name,
				id: tool.id
			};
		});
		console.log("ai is analzing toosl", toolData)

		const toolId = await runnableChainOfToolId.invoke({
			longTerm: chatHistory.longTermKey.length > 0 ? chatHistory.longTermKey : "No chat history available.",
			shortTerm: chatHistory.shortTermKey.length > 0 ? chatHistory.shortTermKey : "No chat history available.",
			prompt: prompt,
			tools: JSON.stringify(toolData)
		});

		try {
			const parsedToolId = JSON.parse(toolId);
			console.log("parsedToolId -- == -- == -- == ", parsedToolId)
			return parsedToolId;
		} catch (error: any) {
			console.error('Error determining tool ID:', error);
			socket.emit('error', 'Error determining tool ID.');

			return [];

		}


	} catch (error) {
		console.error('Error determining tool ID:', error);
		socket.emit('error', 'Error determining tool ID.');

		return []
	}
}
import { Socket } from "socket.io";
import { abstractChathistory, executeIntend, findAndExecuteIntend, FindNeedOfBudgetSlider, GetAnswerFromPrompt, getChatName, getMateyExpession, getToolIdToConsider, getUserIntend, inititalSummurizeChat, isToolInventoryAccessNeeded } from "./langchain/langchain.js";
import { produceMessage, produceNewMessage } from "./kafka.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { IChatMemory, iChatname, INewUserMessage } from "../types/types.js";
import { createnewUserChatInstace } from "../controller/_private/createNewUserChatInstance.controller.js";
import { appendArrayItemInRedis, getRedisData, setRedisData, storeDataTypeSafe } from "./redis.js";
import connectDB from "../db/db.db.js";
import { UserPayment } from "../models/userPayment.model.js";
import { Chat } from "../models/chat.model.js";
import User from "../models/user.model.js";
import UserMemory from "../models/userMemory.model.js";
import { isLongTermMemoryNeeded, memory, updateChatMemory } from "./memory.js";
import UserToolInventory from "../models/userToolInventory.model.js";
import UserChat from "../models/userChat.model.js";
import { cleanMemory } from "../utils/utilsFunction.js";
import TempSession from "@/models/preview/session.model.js";

export async function handleSocketSerivce(socket: Socket) {

    console.log('Client connected', socket.id, '----------------------------------');

    //   this event will create session in database | check current user paid plan and server as per their plan
    socket.on('createSession', async (message) => {
        const ObjectId = new mongoose.Types.ObjectId();
        socket.emit('acknowledgement', {
            sessionId: ObjectId,
        });
    });
    // free user 
    socket.on('message', async (message: {
        prompt: string,
        sessionId: string
    }) => {
        const { prompt, sessionId } = message;
        await GetAnswerFromPrompt(prompt, sessionId, socket);
        await produceMessage(prompt, sessionId, '', 'user');
    });


    // this service creates new session for user
    socket.on('createNewUserSession', () => { handleCreateNewSession(socket) });

    // this service gives name for the chat 
    socket.on('getChatName', async (data: iChatname) => handleGetChatName(socket, data))



    // socket.on('preview',async ())
    // tool Inventory : {name,description} []
    socket.on("freeUserMessage",async (data:{
        prompt:string,
        id:string,
        toolInventory:string[]
    })=>{
        const wholeMemory:IChatMemory = {
            longTermKey:'',
            shortTermKey:'',
            toolInventoryMemory:[''],
            isToolInventoryMemory:false
        }
        produceNewMessage(data.prompt, data.id, false, false, false, [], [], [], false, [], "user");
        const prevChat = await Chat.find({sessionId:data.id}).sort({createdAt:-1}).limit(5);
        
        // determine need ot tool inveotry
        const isToolInventoryAccessNeeded_ = await isToolInventoryAccessNeeded(data.prompt,{
            shortTermKey: JSON.stringify(prevChat),
            longTermKey:'',
        },
        JSON.stringify(data.toolInventory)
    )
    if(isToolInventoryAccessNeeded_){
        wholeMemory.isToolInventoryMemory=true;
        wholeMemory.toolInventoryMemory=data.toolInventory
    }

    wholeMemory.longTermKey='';
    wholeMemory.shortTermKey=JSON.stringify(prevChat);

        // determine tool need
        const intendList = await getUserIntend(data.prompt, wholeMemory, 2,null);
    console.log(intendList,"k8912739")

    const messageStream = await executeIntend(
        data.prompt,
        wholeMemory,
        data.id,
        intendList,
        data.id,
        2,
        false,
        0,
        socket
    );
    console.log(messageStream,"is here 1234")
    

    })   

    

    socket.on('userMessage', async (data: INewUserMessage) => {
        try {
            
            console.log("budgetDetails in socket", "budgetDetails", data.budgetSliderValue, "isBudgetSliderChangable", data.isBudgetSliderChangable, "isBudgetSliderPresent", data.isBudgetSliderPresent);
            // Initialize controller for stream handling

            // Store initial message
            produceNewMessage(data.message, data.sessionId, false, false, false, [], [], [], false, [], "user")

            //  get the current plan of the user
            const userPlanCacheKey = `USER-PAYMENT-${data.userId}`;
            let currentPlan = 0;
            let mongoUserId;
            let redisUserData = await getRedisData(userPlanCacheKey);
            let coreUserId = ""
            let longTermMem =""
            if (redisUserData.success) {
                const plan = JSON.parse(redisUserData.data).planAccess;
                currentPlan = plan[2] ? 2 : plan[1] ? 1 : 0;
                mongoUserId = JSON.parse(redisUserData.data).id;
                coreUserId = JSON.parse(redisUserData.data).id
            } else {
                await connectDB();
                const user = await User.findOne({ clerkUserId: data.userId }).lean();
                if (!user) throw new Error('User not found');

                const userPlan = await UserPayment.findOne({ userId: user._id });
                if (!userPlan) throw new Error('User payment details not found');

                await setRedisData(userPlanCacheKey, userPlan, 3600);
                currentPlan = userPlan.planAccess[2] ? 2 : userPlan.planAccess[1] ? 1 : 0;
                coreUserId = JSON.stringify(user._id)
                mongoUserId = user._id;
            }
            console.log(coreUserId,"is here ")
            
            // handle long term
            if(currentPlan === 2) {

                const existingMemory = await UserMemory.findOne({userId:coreUserId});
                if(existingMemory){
                    const isLongTermMemory = await isLongTermMemoryNeeded(data.message, existingMemory.memory.join(" "));
                    
                    if(isLongTermMemory){
                        const newMem = await updateChatMemory(data.message, existingMemory?.memory ? JSON.stringify(existingMemory.memory) : "", "long");
                        longTermMem = newMem.data?.join() || ""
                        console.log(newMem,"is here!");
                        existingMemory.memory = newMem.data || [];
                        await existingMemory.save();
                    }

                }
                else{
                    await UserMemory.create({
                        userId:coreUserId,
                        memory:[]
                    })
                }

            }


            // handle generatal
            const chatData = await Chat.find({ sessionId: data.sessionId }).sort({ createdAt: -1 }).limit(10);
            console.log("chatData", chatData,longTermMem);

            const wholeMemory: IChatMemory = {
                longTermKey: longTermMem,
                shortTermKey: JSON.stringify(chatData.map(item => {
                    const chatItem: any = {
                        role: item.role,
                        message: item.message,
                    };
                    if (item.isBunningsProduct) {
                        chatItem.bunnngsProduct = item.bunningsProductList.map(product => product.categoryName);
                    }
                    if (item.isMateyProduct) {
                        chatItem.aiGeneratedProducts = item.mateyProduct.map(product => product.categoryName);
                    }
                    return chatItem;
                })),
            };

            console.log("wholeMemory:: - :: -- :: -- 111111", wholeMemory);

            // tool inventory access

            let isToolInventoryAccess = false;
            if (currentPlan === 2) {
                try {
                        // get the tool inventory map
                       let userToolmap = ``;
                       
                        const redisDataToolsMap = await getRedisData(`USER-TOOL-${data.userId}`);
                        if(redisDataToolsMap.success) {
                            console.log('Tool map found in Redis:', redisDataToolsMap.data);
                            userToolmap = redisDataToolsMap.data;
                        }
                        else {
                            console.log('Tool map not found in Redis, fetching from database...');
                            // get from database and store in redis
                            const userTools = await UserToolInventory.find({ userId: mongoUserId }).sort({ createdAt: -1 }).lean();
                            const map = userTools.map((tool,index) => {
                                console.log("tool is",tool,`Tool ${index} : ${tool.name} `);
                                return ` Tool ${index} : ${tool.name} `
                            });
                            console.log(map,"map for the cache is here");
                            userToolmap = JSON.stringify(map);
                            console.log('Tool map fetched from database:', map);

                            await setRedisData(`USER-TOOL-${data.userId}`, JSON.stringify(map), 3600);
                            console.log('Tool map stored in Redis:', map);
                        }

                        // get the tool intent

                    console.log('Checking if tool inventory access is needed...');
                    isToolInventoryAccess = await isToolInventoryAccessNeeded(data.message, wholeMemory, userToolmap);
                    console.log('Tool inventory access needed:', isToolInventoryAccess);

                    if (isToolInventoryAccess) {
                        console.log('Fetching user tools from database...');
                        const userTools = await UserToolInventory.find({ userId: mongoUserId }).sort({ createdAt: -1 }).lean();
                        console.log('User tools fetched:', userTools);

                        const preprocessedTools = userTools.map(tool => {
                            return {
                                name: tool.name,
                                description: tool.description,
                                count: tool.count,
                                tags: tool.tags?.join(", "),
                                ...tool.customFields,
                                id: tool._id.toString() // Convert ObjectId to string
                            }
                        });
                        if (userTools.length > 0) {
                            console.log('Getting tool IDs to consider...');
                            const idPicks = await getToolIdToConsider(data.message, wholeMemory, preprocessedTools, socket);
                            console.log('Tool IDs to consider:', idPicks);

                            if (idPicks.length > 0) {
                                console.log('Tool IDs picked:', idPicks);
                                const newToolInventory = preprocessedTools.filter(tool => {
                                    console.log("Tool is",tool,"picking it is", idPicks.includes(tool.id));
                                    return idPicks.includes(tool.id)
                                });
                                console.log('Filtered tool inventory:', newToolInventory);
                                
                                const newMemory = newToolInventory.map(tool => {
                                    let customFields = "";
                                    if (tool && typeof tool === 'object' && tool !== null) {
                                        customFields = Object.keys(tool)
                                            .filter(key => !['name', 'description', 'count', 'tags', 'id'].includes(key))
                                            .map(key => `${key}: ${tool[key]}`)
                                            .join(", ");
                                    }
                                    console.log(customFields, "customFields0101010101010101010101010");
                                    console.log(` Item Name: ${tool.name}
                                        Description: ${tool.description.slice(0, 100)}
                                        Quantity: ${tool.count}
                                        Tags: ${tool.tags}
                                        ${customFields}`);
                                    return `
                                        Item Name: ${tool.name}
                                        Description: ${tool.description.slice(0, 100)}
                                        Quantity: ${tool.count}
                                        Tags: ${tool.tags}
                                        ${customFields}
                                    `;
                                });
                                console.log('New memory for tool inventory:', newMemory);
                                wholeMemory['toolInventoryMemory'] = newMemory;
                                wholeMemory['isToolInventoryMemory'] = true;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching tool inventory:', error);
                }
            }

            console.log("wholeMemory:: - :: -- :: -- 222222", wholeMemory);
            
            
            // Process based on plan type
            switch (currentPlan) {
                case 1: {
                    await getMateyExpession(data.message, socket);
                    const intendList = await getUserIntend(data.message, wholeMemory, currentPlan,null);
                    socket.emit('intendList', intendList);

                    const messageStream = await executeIntend(
                        data.message,
                        wholeMemory,
                        data.sessionId,
                        intendList,
                        data.userId,
                        currentPlan,
                        false,
                        0,
                        socket
                    );
                    if (data.isBudgetSliderChangable) {
                        await FindNeedOfBudgetSlider(data.message, wholeMemory, socket);
                    }
                    if (messageStream) {

                        await Promise.all([
                            produceNewMessage(
                                messageStream.message,
                                data.sessionId,
                                messageStream.isProductSuggested,
                                messageStream.isMateyProduct,
                                messageStream.isBunningsProduct,
                                messageStream.productSuggestionList,
                                messageStream.mateyProduct,
                                messageStream.bunningsProductList,
                                messageStream.isCommunitySuggested,
                                messageStream.communityId || [],
                                "ai"
                            ),
                            produceNewMessage(
                                messageStream.emo,
                                data.sessionId,
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
                        ]);


                       
                    }
                    break;
                }

                case 2: {
                    await getMateyExpession(data.message, socket);

                    const intendListPro = await getUserIntend(data.message, wholeMemory, currentPlan,isToolInventoryAccess,wholeMemory.toolInventoryMemory);
                    socket.emit('intendList', intendListPro);

                    const messageStreamPro = await executeIntend(
                        data.message,
                        wholeMemory,
                        data.sessionId,
                        intendListPro,
                        data.userId,
                        currentPlan,
                        Boolean(data.budgetSliderValue),
                        data.budgetSliderValue || 0,
                        socket
                    );
                    if (messageStreamPro) {

                        await Promise.all([
                            produceNewMessage(
                                messageStreamPro.message,
                                data.sessionId,
                                messageStreamPro.isProductSuggested,
                                messageStreamPro.isMateyProduct,
                                messageStreamPro.isBunningsProduct,
                                messageStreamPro.productSuggestionList,
                                messageStreamPro.mateyProduct,
                                messageStreamPro.bunningsProductList,
                                messageStreamPro.isCommunitySuggested,
                                messageStreamPro.communityId || [],
                                "ai"
                            ),
                            produceNewMessage(
                                messageStreamPro.emo,
                                data.sessionId,
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
                        ]);
                    }

                    if (data.isBudgetSliderChangable) {
                        await FindNeedOfBudgetSlider(data.message, wholeMemory, socket);
                    }
                    break;
                }

                default:
                    socket.emit('error', "No valid plan found");
            }

        } catch (error: any) {
            console.error('Error processing message:', error);
            socket.emit('error', {
                message: error.message || 'An error occurred while processing your message',
                success: false
            });
        } finally {
            socket.emit('statusOver', {});
        }
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

}


async function handleCreateNewSession(socket: Socket) {

    const newSessionId = uuidv4();
    socket.emit('newSessionAcknowledge', {
        sessionId: newSessionId,
    });

}

// this function will take prompt and emit chatName event with chatName

// if everything goes well it will emit success true
// if something goes wrong it will emit success false
async function handleGetChatName(socket: Socket, data: iChatname) {
    const prompt = data.prompt;
    const chatName = await getChatName(prompt);

    // create new Database instance 

    const isDbEntryCreated = await createnewUserChatInstace({
        sessionId: data.sessionId,
        userId: data.userId,
        chatName: chatName,
    });

    if (!isDbEntryCreated) {
        socket.emit('chatName', {
            success: false,
            sessonId: data.sessionId,
            message: 'Error creating new Chat',
            chatName: chatName
        })
    }
    socket.emit('chatName', {
        success: true,
        sessionId: data.sessionId,
        message: "New Chat Inititalized",
        chatName: chatName,
        id: isDbEntryCreated._id!
    })
}


// Get chat history from cache or DB
            // const cacheKey = `USER-CHAT-${data.sessionId}`;
            // const chatHistory = await getRedisData(cacheKey).then(async (redisChatData) => {
            //     if (redisChatData.success) {
            //         return redisChatData.data;
            //     }

            //     await connectDB();
            //     const dbChatHistory = await Chat.find({ sessionId: data.sessionId })
            //         .sort({ _id: -1 })
            //         .limit(30);

            //     if (dbChatHistory.length > 0) {
            //         const chatHistoryStore = dbChatHistory.map(chat => ({
            //             role: chat.role,
            //             message: chat.message,
            //         }));

            //         const contextedChat = await inititalSummurizeChat(JSON.stringify(chatHistoryStore));
            //         await setRedisData(cacheKey, JSON.stringify(contextedChat), 3600);
            //         return contextedChat;
            //     }

            //     return [];
            // }); 

            // // Process new chat context
            // const newChatContext = await abstractChathistory(chatHistory, {
            //     message: data.message,
            //     role: 'user',
            // });
            // await appendArrayItemInRedis(cacheKey, newChatContext);

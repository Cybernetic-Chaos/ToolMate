import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { isWithinTokenLimit, encode } from "gpt-tokenizer";
import { summarizeToTokenLimit } from "./langchain/langchain.js";
import { GPT_MODEL1 } from "../constants.js";

dotenv.config();

// Constants for configuration
const TOKEN_LIMITS = {
    essential: { long: 1020000, short: 765000 },
    pro: { long: 1700000, short: 1275000 },
} as const;

const MEMORY_CONFIG = {
    LONG_TERM_FREEUP_PERCENTAGE: 20,
    SHORT_TERM_FREEUP_PERCENTAGE: 15,
    MIN_MEMORY_CHUNK_SIZE: 100, // Minimum size for memory chunks to prevent over-fragmentation
} as const;

// Type definitions for better type safety
type PlanType = 1 | 2; // 1 = essential, 2 = pro
type MemoryType = "long" | "short";
type Plan = keyof typeof TOKEN_LIMITS;

interface MemoryResponse {
    success: boolean;
    error?: string;
    memory?: string;
    limit?: boolean;
    longTermMemoryUpdate?: boolean;
    shortTermMemoryUpdate?: boolean;
}

// Initialize LLM once and cache it
const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: GPT_MODEL1,
    temperature: 0.1, // Lower temperature for more consistent responses
    maxRetries: 3, // Add retries for reliability
});
// Cached prompt templates for better performance
const longTermMemoryTemplate = PromptTemplate.fromTemplate(`
    Analyze the user prompt and determine if it contains information that should be stored in long-term memory.
    
    Return ONLY 'true' or 'false' based on the following criteria:
    - If the prompt contains information that should be remembered permanently, return 'true'
    - If the prompt is general or not relevant for future conversations, return 'false'

    User Prompt: {prompt}
    Current Chat Memory: {chatMemory}
`);

const shortTermMemoryTemplate = PromptTemplate.fromTemplate(`
    Analyze the user prompt and determine if it contains information that should be stored in short-term memory.
    Return ONLY 'true' if the prompt includes:
    - Temporary instructions relevant to this session
    - Task sequences specific to the current session
    - Context pertinent to the ongoing session
    - Any information that could be useful for the current session

    Return ONLY 'false' if the prompt:
    - Contains general knowledge or information requests
    - Is already stored in long-term memory

    User Prompt: {prompt}
    Current Chat Memory: {chatMemory}
`);

// Memoized chain creation
const createMemoryChain = (() => {
    const chains = new Map();

    return (template: PromptTemplate) => {
        if (!chains.has(template)) {
            const chain = template.pipe(llm).pipe(new StringOutputParser());
            chains.set(template, RunnableSequence.from([chain, new RunnablePassthrough()]));
        }
        return chains.get(template);
    };
})();

// Backbone of memory module
async function memory(prompt: string, shortTermMemory: string, longTermMemory: string, planAccess: 1 | 2) {


    console.log("Memory function called with prompt:", prompt);
    let isLongTerm = false;
    let isShortTerm = false;

    if (planAccess === 1) {
        if (shortTermMemory.length === 0) {
            isShortTerm = true;
        } else {
            const shortTermResponse = await isShortTermMemoryNeeded(prompt, shortTermMemory);
            console.log("Short term memory response for plan 1:", shortTermResponse);
            if (shortTermResponse.success) {
                isShortTerm = shortTermResponse.shortTermMemoryUpdate!;
            }
        }
    } else {
        const [longTermResponse, shortTermResponse] = await Promise.all([
            isLongTermMemoryNeeded(prompt, shortTermMemory),
            shortTermMemory.length === 0 ? Promise.resolve({ success: true, shortTermMemoryUpdate: true }) : isShortTermMemoryNeeded(prompt, longTermMemory)
        ]);
        console.log("Long term memory response:", longTermResponse);
        console.log("Short term memory response:", shortTermResponse);
        if (longTermResponse.success) {
            isLongTerm = longTermResponse.longTermMemoryUpdate!;
        }
        if (shortTermResponse.success) {
            isShortTerm = shortTermResponse.shortTermMemoryUpdate!;
        }
    }
    let newLongTermMemory = longTermMemory;
    let newShortTermMemory = shortTermMemory;
    if (longTermMemory.length === 0 && shortTermMemory.length === 0) {
        console.log("Both memories are empty");
    } else {
        [newLongTermMemory, newShortTermMemory] = await Promise.all([
            isLongTerm && longTermMemory.length > 0 ? (await exceededAndFreeMemory(longTermMemory, planAccess, "long")).memory : longTermMemory,
            isShortTerm && shortTermMemory.length > 0 ? (await exceededAndFreeMemory(shortTermMemory, planAccess, "short")).memory : shortTermMemory
        ]);
    }

    console.log("New long term memory:", newLongTermMemory);
    console.log("New short term memory:", newShortTermMemory);

    let updatedLongTermMemory: any = newLongTermMemory;
    let updatedShortTermMemory: any = newShortTermMemory;

    if (isLongTerm && isShortTerm) {
        const [newLongTerm, newShortTerm] = await Promise.all([
            updateChatMemory(prompt, newLongTermMemory, 'long'),
            updateChatMemory(prompt, newShortTermMemory, 'short')
        ]);
        console.log("Updated long term memory:", newLongTerm);
        console.log("Updated short term memory:", newShortTerm);
        if (newLongTerm.success) {
            updatedLongTermMemory = newLongTerm.data;
        }
        if (newShortTerm.success) {
            updatedShortTermMemory = newShortTerm.data;
        }
    } else if (isLongTerm) {
        const newLongTerm = await updateChatMemory(prompt, newLongTermMemory, 'long');
        console.log("Updated long term memory:", newLongTerm);
        if (newLongTerm.success) {
            updatedLongTermMemory = newLongTerm.data;
        }
    } else if (isShortTerm) {
        const newShortTerm = await updateChatMemory(prompt, newShortTermMemory, 'short');
        console.log("Updated short term memory:", newShortTerm);
        if (newShortTerm.success) {
            updatedShortTermMemory = newShortTerm.data;
        }
    }

    if (planAccess === 1) {
        return {
            success: true,
            planAccess,
            flags: {
                isLongTerm,
                isShortTerm
            },
            shortTermMemory: updatedShortTermMemory
        };
    } else {
        return {
            success: true,
            planAccess,
            flags: {
                isLongTerm,
                isShortTerm
            },
            longTermMemory: updatedLongTermMemory,
            shortTermMemory: updatedShortTermMemory
        };
    }
}

// Optimized memory evaluation functions
async function isLongTermMemoryNeeded(prompt: string, previousMemory: string): Promise<MemoryResponse> {
    console.log("Evaluating long term memory need for prompt:", prompt);
    try {
        const chain = createMemoryChain(longTermMemoryTemplate);
        const result = await chain.invoke({ prompt, chatMemory: previousMemory });
        console.log("Long term memory evaluation result:", result);

        return {
            success: true,
            longTermMemoryUpdate: result.toLowerCase().includes('true')
        };
    } catch (error: any) {
        console.error("Error evaluating long term memory need:", error);
        return {
            success: false,
            error: error.message || "Failed to evaluate long-term memory need",
            longTermMemoryUpdate: false
        };
    }
}

async function isShortTermMemoryNeeded(prompt: string, previousMemory: string): Promise<MemoryResponse> {
    console.log("Evaluating short term memory need for prompt:", prompt);
    try {
        const chain = createMemoryChain(shortTermMemoryTemplate);
        const result = await chain.invoke({ prompt, chatMemory: previousMemory });
        console.log("Short term memory evaluation result:", result);

        return {
            success: true,
            shortTermMemoryUpdate: result.toLowerCase().includes('true')
        };
    } catch (error: any) {
        console.error("Error evaluating short term memory need:", error);
        return {
            success: false,
            error: error.message || "Failed to evaluate short-term memory need",
            shortTermMemoryUpdate: false
        };
    }
}

async function exceededAndFreeMemory(
    currMemory: string,
    currentPlan: PlanType,
    memoryType: MemoryType
) {
    console.log(`Checking if memory exceeds limit for ${memoryType} memory with current plan ${currentPlan} and memory:`, currMemory);
    // Early return for essential plan trying to use long-term memory
    if (currentPlan === 1 && memoryType === "long") {
        console.log("Essential plan doesn't support long-term memory");
        return {
            success: true,
            memory: currMemory,
            error: "Essential plan doesn't support long-term memory"
        };
    }

    const plan = currentPlan === 1 ? 'essential' : 'pro';
    const tokenLimit = TOKEN_LIMITS[plan][memoryType];

    try {
        // Check if current memory is within token limit
        if (isWithinTokenLimit(currMemory, tokenLimit)) {
            console.log("Memory is within token limit");
            return {
                success: true,
                limit: true,
                memory: currMemory
            };
        }

        // Parse memory and handle free up
        let memoryParsed;
        try {
            memoryParsed = JSON.parse(currMemory);
        } catch (error: any) {
            console.error("Failed to parse memory:", error);
            return {
                success: false,
                memory: currMemory,
                error: `Failed to parse memory: ${error.message}`
            };
        }
        const freeUpPercentage = memoryType === "long" ?
            MEMORY_CONFIG.LONG_TERM_FREEUP_PERCENTAGE :
            MEMORY_CONFIG.SHORT_TERM_FREEUP_PERCENTAGE;

        const fitMemory = await freeUpMemory(memoryParsed, freeUpPercentage, memoryType);
        console.log("Memory after freeing up:", fitMemory);

        return {
            success: fitMemory.success,
            limit: false,
            memory: JSON.stringify(fitMemory.memory)
        };
    } catch (error: any) {
        console.error("Memory processing failed:", error);
        return {
            success: false,
            memory: currMemory,
            error: `Memory processing failed: ${error.message}`
        };
    }
}

async function freeUpMemory(
    memory: string[],
    freeUpPercentage: number,
    memoryType: MemoryType
): Promise<{ success: boolean; memory: string[] }> {
    console.log(`Freeing up ${freeUpPercentage}% of ${memoryType} memory`);
    try {
        const totalTokens = memory.reduce((acc, curr) => acc + encode(curr).length, 0);
        const tokensToRemove = Math.floor(totalTokens * (freeUpPercentage / 100));
        console.log("Total tokens:", totalTokens, "Tokens to remove:", tokensToRemove);

        if (memoryType === "long") {
            return await handleLongTermMemoryFreeing(memory, tokensToRemove);
        } else {
            return handleShortTermMemoryFreeing(memory, tokensToRemove);
        }
    } catch (error: any) {
        console.error('Memory cleanup failed:', error);
        return { success: false, memory };
    }
}

async function handleLongTermMemoryFreeing(memory: string[], tokensToRemove: number) {
    console.log("Handling long term memory freeing");
    let currentTokens = 0;
    let elementsToSummarize: string[] = [];

    // Collect elements to summarize
    for (const item of memory) {
        const itemTokens = encode(item).length;
        if (currentTokens + itemTokens <= tokensToRemove) {
            elementsToSummarize.push(item);
            currentTokens += itemTokens;
        } else {
            break;
        }
    }

    if (elementsToSummarize.length === 0) {
        return { success: true, memory };
    }

    // Summarize collected elements
    const summarized = await summarizeToTokenLimit(
        elementsToSummarize.join(". "),
        tokensToRemove
    );

    console.log("Summarized memory:", summarized);

    return {
        success: true,
        memory: [summarized, ...memory.slice(elementsToSummarize.length)]
    };
}

function handleShortTermMemoryFreeing(memory: string[], tokensToRemove: number) {
    console.log("Handling short term memory freeing");
    let currentTokens = 0;
    let indexToSlice = 0;

    // Find cut-off point
    for (const [index, item] of memory.entries()) {
        const itemTokens = encode(item).length;
        if (currentTokens + itemTokens <= tokensToRemove) {
            currentTokens += itemTokens;
            indexToSlice = index + 1;
        } else {
            break;
        }
    }

    console.log("Memory after slicing:", memory.slice(indexToSlice));

    return {
        success: true,
        memory: memory.slice(indexToSlice)
    };
}

export async function updateChatMemory(prompt: string, chatMemory: string, memoryType: 'long' | 'short') {
    console.log(`Updating chat memory for ${memoryType} memory with prompt:`, prompt);
    try {
        const longTermPrompt = `
        Analyze the prompt and extract ONLY information that should be stored as permanent, long-term memory.

        INCLUDE information about:
        - User preferences (UI, language, notifications, etc.)
        - Important settings and configurations
        - Critical decisions or choices
        - Persistent requirements or constraints
        - Key facts that might be needed in future conversations
        
        GUIDELINES:
        - Be extremely specific and precise
        - Format as complete sentences
        - create whole new full memory which combine both old and new memory. so dont just create new item but create whole new chat memory with exisiting and new memory items
        - you can perform Addition and deletion of memory element. but prefer not to till user not explicitly tell to
        
        OUTPUT FORMAT:
        Return ONLY an array of strings: ["memory item 1", "memory item 2"]
        No explanations or additional text just array as given format.
        
        ["existing memory item1" ,"exisitng memory item 2 ","....","new Item"]
        User Prompt: {prompt}
        Current Memory: {chatMemory}
        `;

        const shortTermPrompt = `
        Analyze the prompt and extract ONLY information needed for the current session or immediate context.

        INCLUDE information about:
        - Current conversation context
        - Temporary instructions or guidance
        - Ongoing task details
        - Session-specific references
        - Immediate user needs or requests
        
        DO NOT include:
        - Information already in memory

        GUIDELINES:
        - Focus on immediate relevance
        - Keep context for current session only
        - Be specific but concise
        - make an detailed but brief sentence of the clear memory information
        - Only extract NEW information not present in current memory
        
        
        OUTPUT FORMAT:
        Return ONLY an array of strings: ["memory item 1", "memory item 2"]
        No explanations or additional text.
        make sure the new array dont take reference from existing memory ,just create new memory combining everything
        User Prompt: {prompt}
        Current Memory: {chatMemory}
        `;

        const selectedPrompt = memoryType === 'long' ? longTermPrompt : shortTermPrompt;
        const updateChatMemoryTemplate = PromptTemplate.fromTemplate(selectedPrompt);
        const updateChatMemoryLLMChain = updateChatMemoryTemplate.pipe(llm).pipe(new StringOutputParser());
        const runnableChainOfUpdateChatMemory = RunnableSequence.from([updateChatMemoryLLMChain, new RunnablePassthrough()]);
        const updatedChatMemory = await runnableChainOfUpdateChatMemory.invoke({ prompt, chatMemory });

        console.log("Updated chat memory result:", updatedChatMemory);

        let newMemory;
        let oldMemory = [];
        try {
            // Parse new memory, ensuring it's an array
            newMemory = JSON.parse(updatedChatMemory);
            if (chatMemory.length > 0) {
                oldMemory = JSON.parse(chatMemory.trim());
            }
            console.log("Old memory items:", oldMemory);
            console.log("New memory items:", newMemory);
            if (!Array.isArray(newMemory)) {
                // If not an array but a string containing array format, try to parse it
                const arrayMatch = updatedChatMemory.match(/\[([\s\S]*)\]/);
                if (arrayMatch) {
                    newMemory = JSON.parse(`[${arrayMatch[1]}]`);
                    console.log("RETRY1 ::: Parsed new memory items:", newMemory);
                } else {
                    throw new Error('Invalid memory format returned');
                }
            }

            // Validate arrays
            if (!Array.isArray(newMemory) || !Array.isArray(oldMemory)) {
                throw new Error('Invalid memory array format');
            }
        } catch (error: any) {
            console.error('Memory parsing error:', error);
            return {
                success: false,
                error: 'Error processing memory update'
            };
        }

        // Combine old and new memory items, remove duplicates and empty items
        const combinedMemory = [...oldMemory, ...newMemory];
        const validMemory = combinedMemory.filter((item, index) =>
            item &&
            typeof item === 'string' &&
            item.trim() !== '' &&
            combinedMemory.indexOf(item) === index
        ).map(item => item.trim());

        console.log("Valid combined memory items:", validMemory);

        return {
            success: true,
            data: validMemory,
        };
    } catch (error: any) {
        console.error('Error updating chat memory:', error);
        return {
            success: false,
            error: 'Error updating chat memory',
        };
    }
}

export {
    memory,
    isLongTermMemoryNeeded,
    isShortTermMemoryNeeded,
    exceededAndFreeMemory,
    freeUpMemory,
    TOKEN_LIMITS,
    MEMORY_CONFIG
};










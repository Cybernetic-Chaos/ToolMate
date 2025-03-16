import { ChatSession, ResponseFormat } from "../types/types.js";
import { Chat } from "../models/chat.model.js";
import { encode, isWithinTokenLimit } from "gpt-tokenizer";
export async function getChatMessages(sessionId: string, memorySize: number) {
    const chatHistory = await Chat.find({ sessionId });
    if (chatHistory.length > memorySize) {
        return chatHistory.slice(chatHistory.length - memorySize, chatHistory.length);
    }
    return chatHistory;
}

export async function getPremiumUserChatMessage(sessionId: string, memorySize: number) {
    const chatHistory = await Chat.find({ sessionId }, { sort: { createdAt: -1 } });
    if (chatHistory.length > memorySize) {
        return chatHistory.slice(chatHistory.length - memorySize, chatHistory.length);
    }
    return chatHistory.reduce((acc: any, chat) => {
        acc.push(chat.message);
        return acc
    }, []);
}
export function categorizeChatSessions(sessions: ChatSession[]) {
    const response: {
        dateDiff: string,
        data: ResponseFormat[]
    }[] = [];
    const now = new Date();

    const categoryMap: { [key: string]: any[] } = {}; // Temporary storage for categorized data

    sessions.forEach(session => {
        const updatedAt = new Date(session.updatedAt);
        const timeDiff = now.getTime() - updatedAt.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        const weeksDiff = Math.floor(daysDiff / 7);
        const monthsDiff = Math.floor(daysDiff / 30);

        const sessionData = {
            sessionId: session.sessionId,
            chatName: session.chatName,
            id: session.id
        };

        let categoryKey = "";

        if (daysDiff === 0) {
            categoryKey = "today";
        } else if (daysDiff === 1) {
            categoryKey = "yesterday";
        } else if (daysDiff > 1 && daysDiff < 30) {
            categoryKey = `previous_${daysDiff}_days`;
        } else if (weeksDiff < 12) {
            categoryKey = `previous_${weeksDiff}_weeks`;
        } else if (monthsDiff < 12) {
            categoryKey = `previous_${monthsDiff}_months`;
        } else {
            categoryKey = "previous_years";
        }

        // Push the sessionData into the respective category
        categoryMap[categoryKey] = categoryMap[categoryKey] || [];
        categoryMap[categoryKey].unshift(sessionData);
    });

    // Convert categoryMap to the required format [{ dateDiff: '...', data: [...] }]
    Object.keys(categoryMap).forEach(key => {
        response.push({
            dateDiff: key,
            data: categoryMap[key]
        });
    });

    // Sort the response in the desired order
    const order = [
        "today",
        "yesterday",
        ...Array.from({ length: 30 }, (_, i) => `previous_${i + 1}_days`),
        ...Array.from({ length: 12 }, (_, i) => `previous_${i + 1}_weeks`),
        ...Array.from({ length: 12 }, (_, i) => `previous_${i + 1}_months`),
        "previous_years"
    ];

    response.sort((a, b) => {
        return order.indexOf(a.dateDiff) - order.indexOf(b.dateDiff);
    });

    return response;
}

export function wrapWordsInQuotes(input: any) {
    return input.replace(/(\b\w+\b)(?=\s*:)/g, (match: any) => {
        // Check if the match is already wrapped in quotes
        if (!/^".*"$/.test(match)) {
            return `"${match}"`; // Wrap in quotes if not already
        }
        return match; // Leave as is if already wrapped
    });
}


export function parseJsonString(input: string) {
    // Remove any leading/trailing backticks and ```json code block markers
    const cleanedInput = input.replace(/```json|```/g, '').trim();

    try {
        // Parse the cleaned JSON string
        return JSON.parse(cleanedInput);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return null;
    }
}

export function calculateProrationPrice(existingPrice: number, newPrice: number, daysRemaining: number, totalDays: number): number {
    const dailyExistingPrice = existingPrice / totalDays;
    const dailyNewPrice = newPrice / totalDays;
    const prorationPrice = (dailyNewPrice - dailyExistingPrice) * Math.floor(daysRemaining);
    return parseFloat(prorationPrice.toFixed(2));
}

export function getDays(prefix: string, duration: number) {
    if (prefix == "MONTH") {
        return (duration * 30);
    }
    return (duration * 365);
}

const valid_keys_to_store = [`USER-CHAT`];

export function getMatchingPrefix(str: string) {
    for (const prefix of valid_keys_to_store) {
        if (str.startsWith(prefix)) {
            return {
                isMatched: true,
                prefix
            };
        }
    }
    return {
        isMatched: false,
        prefix: null
    }; // No valid prefix found
}


export function cleanMemory(memoryString: string): string[] {
    try {
        // Fix over-escaped JSON string
        let parsed = JSON.parse(memoryString); // First parse
        if (typeof parsed === "string") {
            parsed = JSON.parse(parsed); // Second parse (if needed)
        }

        // Ensure it's an array
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error parsing long-term memory:", error, memoryString);
        return [];
    }
}

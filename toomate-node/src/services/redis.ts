import connectDB from '../db/db.db.js';
import UserChat from '../models/userChat.model.js';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { Chat } from '../models/chat.model.js';
import UserMemory from '../models/userMemory.model.js';
import { getMatchingPrefix } from '../utils/utilsFunction.js';

dotenv.config();

let redisInstance: Redis;
let expirationSubscriber: Redis | null = null;

async function startRedisConnection(): Promise<Redis> {
    try {
        const redis = new Redis({
            username: process.env.REDIS_USERNAME,
            host: process.env.REDIS_URL,
            port: parseInt(process.env.REDIS_PORT!),
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 5,
            reconnectOnError: (err) => {
                console.error('Reconnect on error:', err.message);
                return true;
            },
        });


        redis.on('connect', () => {
            console.log('Connected to Redis');
        });

        redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });

        return redis;
    } catch (error: any) {
        console.error('Error connecting to Redis:', error);
        throw new Error(error.message);
    }
}

// Store both the value and its metadata in Redis
async function setRedisData(key: string, value: any, expiry: number = 3600) {
    try {

        console.log('Setting data to Redis:', key, value, expiry);
        // Store the actual value with expiration as before
        const data = await redisInstance.set(key, JSON.stringify(value), 'EX', expiry);

        return data;
    } catch (error: any) {
        console.error('Error setting data to Redis:', error);
        throw new Error(error.message);
    }
}

async function getRedisData(key: string) {
    try {
        const data = await redisInstance.get(key);
        if (data) {
            console.log('Got data from Redis:', key, JSON.parse(data));
            return {
                success: true,
                data: JSON.parse(data)
            };
        }
        return {
            success: false,
            data: null
        };
    } catch (error: any) {
        console.error('Error getting data from Redis:', error);
        return {
            success: false,
            data: null
        };
    }
}



// Initialize Redis connection and start cleanup
(async () => {
    redisInstance = await startRedisConnection();

})();

// Graceful shutdown
process.on('SIGINT', async () => {
    if (redisInstance) await redisInstance.quit();
    console.log('Redis connections closed');
    process.exit(0);
});


async function appendArrayItemInRedis(key: string, value: any) {
    try {
        const updatedData = [value];
        await redisInstance.set(key, JSON.stringify(updatedData), 'EX', 3600);
        return {
            success: true,
            data: updatedData
        };
    } catch (error: any) {
        console.error('Error overriding data in Redis:', error);
        return {
            success: false,
            data: null
        };
    }
}

async function deleteRedisData(key: string) {
    try {
        const data = await redisInstance.del(key);
        return true;
    } catch (error: any) {
        console.error('Error deleting data from Redis:', error);
        return false
    }
}

async function storeDataTypeSafe(key: string, value: any, ttl: number = 3600) {
    try {
        console.log("Store arrayMatch", key, value, ttl);
        await redisInstance.set(key, value, 'EX', ttl);
        return true;
    } catch (error: any) {
        console.error('Error storing data in Redis:', error);
        return false;
    }
}


// Gracefully close Redis connections on shutdown
process.on('SIGINT', async () => {
    if (redisInstance) await redisInstance.quit();
    console.log('Redis connections closed');
    process.exit(0);
});

export {
    startRedisConnection,
    getRedisData,
    setRedisData,
    appendArrayItemInRedis,
    deleteRedisData,
    storeDataTypeSafe
};
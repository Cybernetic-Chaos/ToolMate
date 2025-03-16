import express from 'express';
import http from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createClient } from 'redis';

import { handleSocketSerivce } from './services/socket.js';
import { clerkRoute } from './routes/webhooks/clerk.route.js';
import { paidDashbaord } from './routes/_private/paidDashboard.js';
import { startMessageConsumer, startNewMessageConsumer } from './services/kafka.js';
import { admin } from './routes/admin/admin.js';
import { community } from './routes/_private/community.js';
import Redis from 'ioredis';
import { setRedisData, startRedisConnection } from './services/redis.js';
import { paidService } from './routes/paidService/paidService.js';
import adsense from './routes/adsense/adsense.js';
import connectDB from './db/db.db.js';
import getPaypalAccessToken from './utils/paypalUtils.js';
import { previewRoute } from './routes/preview/createSession.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
	origin: 'https://toolmate-m.vercel.app',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true, // Allow credentials
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(express.json({ limit: '10mb' }));


// Apply the middleware to /api routes

// web hooks
app.use("/webhook/clerk", express.raw({ type: 'application/json' }));
app.use('/webhook', clerkRoute);

// Routes
app.use('/api/v1', paidDashbaord);
app.use('/api/v1/admin', admin)
app.use('/api/v1', community);
// app.use('/api/v1', paidService)
app.use('/api/v1/adsense', adsense)
app.use('/api/v1/preview', previewRoute)
app.get('/', (req, res) => {
	res.send('Hello World');
});

// services 
await connectDB();
// await setRedisData("USER-CHAT-a160da5c-00d0-48be-82b0-2e232012a218", "['user have 8 year brother','user is woman']", 30);
console.log("redis data set");
console.log("redis connection started");
// Start Kafka consumer
startNewMessageConsumer();
startMessageConsumer();
// const redis = await startRedisConnection();
// const sub = await subscribeToKeyExpiration(redis);
// startRedisConnection();
console.log('starting new message consumer');
// startNewMessageConsumer();
// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.IO server
const io = new SocketIOServer(server, {
	cors: {
		origin: true,
		credentials: true,
	},
	allowEIO3: true,
});

// Handle Socket.IO connections
io.on('connection', (socket: Socket) => handleSocketSerivce(socket));

// Start the server
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

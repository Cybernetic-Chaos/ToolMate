import { Webhook } from 'svix';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from '../db/db.db.js';
import { createUser, deleteUser, updateUser } from '../db/userDataStore.db.js';
dotenv.config();
export async function handleClerkWebhook(req: Request, res: Response) {
  await connectDB()
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('You need a WEBHOOK_SECRET in your .env')
  }

  // Get the headers and body
  const headers: any = req.headers
  const payload: any = req.body
  console.log('payload', payload)
  // Get the Svix headers for verification
  const svix_id = headers['svix-id']
  const svix_timestamp = headers['svix-timestamp']
  const svix_signature = headers['svix-signature']

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Attempt to verify the incoming webhook
  // If successful, the payload will be available from 'evt'
  // If the verification fails, error out and  return error code
  try {
    evt = wh.verify(JSON.stringify(payload), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err: any) {
    console.log('Error verifying webhook:', err.message)
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id } = evt.data
  const eventType = evt.type
  try {
    if (eventType === 'user.created') {

      await createUser(evt.data);
    } else if (eventType === 'user.deleted') {

      await deleteUser(evt.data);
    } else if (eventType === 'user.updated') {

      await updateUser(evt.data);
    }
  } catch (error) {

    return new Response('Error processing event', {
      status: 500
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Webhook received',
  })
}
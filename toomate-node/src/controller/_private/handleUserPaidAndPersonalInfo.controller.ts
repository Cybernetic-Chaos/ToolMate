import connectDB from '../../db/db.db.js';
import User from '../../models/user.model.js';
import { UserPayment } from '../../models/userPayment.model.js';
import { Request, response, Response } from 'express';
import { getRedisData, setRedisData } from '../../services/redis.js';
import updateSubscriptionQueue from '../../models/updateSubscriptionQueue.model.js';
import axios from 'axios';
import getPaypalAccessToken, { getPaypalFormatDate } from '../../utils/paypalUtils.js';
import OverDueList from '../../models/OverDueList.model.js';
import userPaymentLogs from '../../models/userPaymentLogs.model.js';

// Define an interface for the PayPal subscription details
interface PaypalSubscriptionDetails {
	billing_info: {
		next_billing_time: string;
		status: string;
		outstanding_balance: {
			value: string;
		};
		failed_payments_count: number;
	};
}

export async function fetchPaypalSubscription(subscriptionId: string): Promise<PaypalSubscriptionDetails | null> {
	const accessToken = await getPaypalAccessToken();
	const BASE_API_URL = process.env.PAYPAL_API_BASE_URL;

	try {
		const response = await axios.get(
			`${BASE_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			}
		);
		return response.data;
	} catch (error: any) {
		console.error(`Failed to fetch subscription details: ${error.message}`);
		return null;
	}
}

async function pauseSubscriptionIfOverdue(userId: string, subscriptionId: string): Promise<{ success: boolean, message: string }> {

	try {
		// Fetch subscription details from PayPal API
		const subDetails = await fetchPaypalSubscription(subscriptionId);
		if (!subDetails || !subDetails.billing_info) {
			const message = `Subscription details not found for subscriptionId: ${subscriptionId}`;
			console.error(message);
			return { success: false, message };
		}

		const { next_billing_time: nextBillingTime, status, outstanding_balance, failed_payments_count } = subDetails.billing_info;
		const nextBillingCycle = new Date(nextBillingTime);
		const currDate = new Date();

		// Log if subscription status is anything other than ACTIVE (helps with debugging)
		if (status !== "ACTIVE") {
			const message = `Subscription ${subscriptionId} is not active. Current status: ${status}`;
			console.log(message);
			return { success: false, message };
		}

		// Check if subscription is overdue (past next billing cycle and ACTIVE status)
		if (status === "ACTIVE" && currDate > nextBillingCycle) {
			// Check if there are outstanding balances or failed payments
			const outstandingBalance = parseFloat(outstanding_balance.value);
			if (outstandingBalance > 0 || failed_payments_count > 0) {
				console.log(`Subscription ${subscriptionId} has an overdue balance or failed payments.`);

				// Fetch user payment details from database
				const userPaymentDetails = await UserPayment.findOne({ userId });
				if (!userPaymentDetails) {
					const message = `No payment details found for userId: ${userId}`;
					console.error(message);
					return { success: false, message };
				}

				const recentLog = await userPaymentLogs.findOne({
					userId,
					subscriptionId,
					status: { $in: ["Subscription ACTIVE", "ACTIVE"] },
				});
				if (!recentLog) {
					const message = `No recent log entry found for subscription ${subscriptionId}`;
					console.error(message);
					return { success: false, message };
				}
				const newLog = {
					userId,
					subscriptionId,
					status: `Subscription PAUSED: Overdue of payment`,
					baseBillingPlanId: recentLog.baseBillingPlanId,
					planName: recentLog.planName,
					isCouponApplied: recentLog.isCouponApplied,
					couponCode: recentLog.couponCode,
				}

				const currPlanIndex = userPaymentDetails.planAccess.findIndex((val) => val);

				// Create overdue list entry
				await Promise.all([
					userPaymentLogs.create(newLog),
					OverDueList.create({ userId, subscriptionId, planAccess: currPlanIndex !== -1 ? currPlanIndex : 0 }),
				]);
				// Pause user's plan access and clear active plan
				userPaymentDetails.planAccess = [true, false, false];  // Set to Basic plan
				userPaymentDetails.activePlan = '';
				await userPaymentDetails.save();

				// Log the pause action
				const previousLog = await userPaymentLogs.findOne({
					userId,
					subscriptionId,
					status: { $in: ["Subscription ACTIVE", "ACTIVE"] },
				});

				// Create a new log entry for paused subscription
				await userPaymentLogs.create({
					userId,
					subscriptionId,
					status: 'Subscription PAUSED: Overdue of payment',
					baseBillingPlanId: previousLog?.baseBillingPlanId || '',
					planName: previousLog?.planName || '',
					isCouponApplied: previousLog?.isCouponApplied || false,
					couponCode: previousLog?.couponCode || '',
				});

				const message = `Subscription ${subscriptionId} paused due to overdue payment.`;
				console.log(message);
				return { success: true, message }; // Successfully paused subscription
			} else {
				const message = `Subscription ${subscriptionId} is active and no overdue balance or failed payments.`;
				console.log(message);
				return { success: false, message };
			}
		}

		// Return false if no action is needed (subscription not overdue)
		const message = `No overdue conditions found for subscriptionId: ${subscriptionId}.`;
		console.log(message);
		return { success: false, message };
	} catch (error: any) {
		const message = `Error pausing subscription ${subscriptionId}: ${error.message}`;
		console.error(message);
		return { success: false, message };
	}
}

async function handleQueuedSubscriptionUpdates(userId: string, queueData: any) {
	if (!queueData) return;

	const updateDate = new Date(queueData.updatePlanDate);
	const currDate = new Date(getPaypalFormatDate());
	console.log(updateDate, currDate, updateDate <= currDate, "updateDate <= currDate");
	if (updateDate <= currDate) {
		await performPlatformAccessChange(queueData.type, queueData.subscriptionId, String(userId));
		await updateSubscriptionQueue.deleteOne({ _id: queueData._id });
		return {
			success: true,
			status: 202,
			message: 'Your Subscription is Paused Successfully',
		};
	}
}

export async function handleUserPaidAndPersonalInfo(req: Request, res: Response) {
	try {
		const { clerkUserId } = req.body;
		if (!clerkUserId) {
			return res.status(400).json({ success: false, message: 'Please provide clerkUserId' });
		}

		// Check Redis cache
		const cachedData = await getRedisData(`USER-PAYMENT-${clerkUserId}`);
		if (cachedData.success) {
			return res.status(200).json({ success: true, data: JSON.parse(cachedData.data) });
		}

		await connectDB();

		const user = await User.findOne({ clerkUserId });
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		// Handle queued subscription updates
		const queueData = await updateSubscriptionQueue.findOne({ userId: user._id });
		const queueResponse = await handleQueuedSubscriptionUpdates(String(user._id), queueData);
		if (queueResponse) return res.status(queueResponse.status).json(queueResponse);

		const paidUser = await UserPayment.findOne({ userId: user._id });
		if (!paidUser) {
			return res.status(404).json({ success: false, message: 'User payment not found' });
		}


		const responseData = {
			id: user._id,
			clerkUserId: user.clerkUserId,
			planAccess: paidUser.planAccess,
			activePlan: paidUser.activePlan,
			suspendedPlan: paidUser.suspendedPlan,
		};
		// Pause subscription if overdue
		if (paidUser.activePlan) {
			const paused = await pauseSubscriptionIfOverdue(String(user._id), String(paidUser.activePlan));
			if (paused.success) {
				return res.status(200).json({ success: true, data: responseData, message: 'Subscription paused due to overdue payment.', route: '/overdue' });
			}
		}


		// Cache the response
		await setRedisData(`USER-PAYMENT-${clerkUserId}`, JSON.stringify(responseData), 60 * 60 * 24);


		const isFree = !paidUser || paidUser.planAccess[0] || paidUser.activePlan == ""
		return res.status(200).json({ success: true, data: responseData, isFree: isFree });
	} catch (error: any) {
		console.error(`Error in handleUserPaidAndPersonalInfo: ${error.message}`);
		return res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
}

async function performPlatformAccessChange(operationType: string, subscriptionId: string, userId: string) {
	const queueData = await updateSubscriptionQueue.findOne({ userId, subscriptionId });
	if (!queueData) return {
		success: false,
		status: 404,
		message: 'Subscription update failed',
	}
	if (queueData.type !== operationType) return {
		success: false,
		status: 404,
		message: 'Subscription update failed',
	}

	const idx = queueData.updatePlanAccessTo;
	let newPlanAccess = [false, false, false];
	newPlanAccess[idx] = true;


	const newUserPlan = await UserPayment.findOneAndUpdate(
		{ userId },
		{ activePlan: operationType == "downgrade" || operationType == "resume" ? subscriptionId : "", planAccess: newPlanAccess },
		{ new: true }
	)

	if (!newUserPlan) return {
		success: false,
		status: 500,
		message: 'Internal Server Error',
	}

	const previousLog = await userPaymentLogs.findOne({
		userId,
		subscriptionId,
		status: { $in: ["Subscription ACTIVE", "ACTIVE"] },
	});
	if (!previousLog) return {
		success: false,
		status: 404,
		message: 'Subscription update failed',
	}

	const newLog = {
		userId,
		subscriptionId,
		status: `Platform Access Changed to ${newPlanAccess[1] ? "Standard" : newPlanAccess[2] ? "Premium" : "Basic"} Plan. Subscription ${operationType.toUpperCase()}`,
		baseBillingPlanId: previousLog.baseBillingPlanId,
		planName: previousLog.planName,
		isCouponApplied: previousLog.isCouponApplied,
		couponCode: previousLog.couponCode,
	}

	await userPaymentLogs.create(newLog);
	return {
		success: true,
		status: 200,
		message: 'Subscription updated successfully',
	}
}

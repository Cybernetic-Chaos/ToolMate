import axios from 'axios';
import connectDB from '../../db/db.db.js';
import { Request, Response } from 'express';
import getPaypalAccessToken from '../../utils/paypalUtils.js';
import updateSubscriptionQueue from '../../models/updateSubscriptionQueue.model.js';
import userPaymentLogs from '../../models/userPaymentLogs.model.js';
import { PaymentPlan } from '../../models/admin/paymentPlan.model.js';
import { UserPayment } from '../../models/userPayment.model.js';
// user can suspend their subscription

const accessToken = await getPaypalAccessToken();
const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;
async function getSubscriptionDetails(subscriptionId: string) {
	try {
		const response = await axios.get(
			`${BASE_PAYPAL_URL}/v1/billing/subscriptions/${subscriptionId}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			}
		);
		console.log('Subscription details:', response.data);
		return { success: true, data: response.data };
	} catch (error: any) {
		return {
			success: false,
			data: `Error fetching subscription details: ${error.message}`,
		};
	}
}



async function downgardeSubscription(subscriptionId: string, planId: string, durationIndex: 1 | 6 | 12, subData: any) {
	await connectDB();
	// determine the planid to downgrade
	const plans = await PaymentPlan.findOne();
	if (!plans || !plans.essentialProductId || !plans.proProductId) {
		return {
			success: false,
			message: "Plans not found!"
		}
	}

	const isPro = plans.proProductId?.includes(planId);
	if (!isPro) {
		return {
			success: true,
			isFreePlan: true,
			message: "Subscride to free plan"
		}
	}

	const idx = durationIndex == 1 ? 0 : (durationIndex == 6 ? 1 : 2)
	const newPlanId = plans.essentialProductId[idx]
	console.log(newPlanId, "newPlanId");
	// revise the subscription
	const accessToken = await getPaypalAccessToken();
	const baseUrl = process.env.PAYPAL_API_BASE_URL;
	console.log(subData, "sub Data");
	const newSubData = {
		plan_id: newPlanId,
		shipping_amount: subData.shipping_amount,
		shipping_address: {
			name: {
				full_name: subData.subscriber.name.given_name + " " + subData.subscriber.name.surname
			},
			address: subData.subscriber.shipping_address.address,
		},
		application_context: {
			brand_name: process.env.BRAND_NAME || 'Your Brand',
			locale: 'en-US',
			user_action: 'SUBSCRIBE_NOW',
			return_url: process.env.PAYPAL_SUCCESS_REDIRECT_URL,
			cancel_url: process.env.PAYPAL_CANCEL_REDIRECT_URL,
		}
	}
	console.log(newSubData, "new data insfpfslf");
	const revisePlan = await axios.post(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/revise`, newSubData,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

	console.log(revisePlan, "revisePlan");
	if (revisePlan.status !== 200) {
		return {
			success: false,
			isFreePlan: false,
			message: "Failed to downgrade subscription"
		}
	}
	return {
		success: true,
		isFreePlan: false,
		message: "Subscription downgraded successfully"
	}
}

export async function requestSubscriptionPause(req: Request, res: Response) {
	await connectDB();
	try {
		const {
			subscriptionId,
			userId,
			message,
			isDownGradeRequest,
			downGradeDuration,
		} = req.body;

		if (!subscriptionId || !userId || !message) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Please provide subscriptionId, userId, and message',
			});
		}


		// check for existing request
		const existingRequest = await updateSubscriptionQueue.findOne({
			subscriptionId,
			userId,
		});
		if (existingRequest) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Request already exists for this subscription',
			});
		}

		if (
			message !== 'downgrade' &&
			message !== 'suspend' &&
			message !== 'cancel' &&
			message !== ''
		) {
			return res.status(400).json({
				success: false,
				status: 400,
				message:
					'Invalid message type. Please provide downgrade, suspend, or cancel',
			});
		}
		const validDownDate = [0, 1];
		if (
			isDownGradeRequest &&
			!downGradeDuration &&
			!validDownDate.includes(downGradeDuration)
		) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Please provide valid downGradeDuration',
			});
		}

		await connectDB();

		// Fetch subscription details
		const subscriptionDetails =
			await getSubscriptionDetails(subscriptionId);
		if (!subscriptionDetails.success) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Failed to retrieve subscription details',
				error: subscriptionDetails.data,
			});
		}

		const logData = await userPaymentLogs.findOne({ subscriptionId });
		if (!logData) {
			return res.status(404).json({
				success: false,
				status: 404,
				message: 'Subscription log not found',
			});
		}

		// Prepare the new queue document
		const nextBillingDateString =
			subscriptionDetails.data.billing_info.next_billing_time;
		const nextBillingDate: Date = new Date(nextBillingDateString);

		if (isNaN(nextBillingDate.getTime())) {
			return res.status(400).json({
				success: false,
				status: 400,
				message: 'Invalid next billing date format',
			});
		}

		// if donwgrade the downgrade the subscription
		let downgrade;
		if (message === 'downgrade') {
			downgrade = await downgardeSubscription(subscriptionId, subscriptionDetails.data.plan_id, downGradeDuration, subscriptionDetails.data);
			console.dir(downgrade, "downgrade fff");
			if (!downgrade.success) {
				return res.status(400).json({
					success: false,
					status: 400,
					message: 'Failed to downgrade subscription',
					error: downgrade.message,
				});
			}
		}


		// perform paypal subscription pause 
		if (message === 'cancel' || message === 'suspend') {
			const pauseDetails = await performPaypalSubscriptionPause(message, subscriptionId);
			if (!pauseDetails.success) {
				return res.status(400).json({
					success: false,
					message: pauseDetails.message,
					status: 400
				})
			}
		}

		if (message == "suspend") {
			await UserPayment.findOneAndUpdate({
				userId: userId
			}, {
				suspendedPlan: subscriptionId
			})
		}

		const newQueueDoc = {
			userId: userId,
			updatePlanDate: nextBillingDate.toISOString().split('.')[0] + 'Z', // Remove milliseconds
			type: message,
			updatePlanAccessTo: isDownGradeRequest ? (downgrade && downgrade.isFreePlan ? 0 : 1) : 0,
			subscriptionId: subscriptionId,
		};

		// Save the new queue document to the database
		const queueDoc = await updateSubscriptionQueue.create(newQueueDoc);
		if (!queueDoc) {
			return res.status(500).json({
				success: false,
				status: 500,
				message: 'Failed to save the request to the queue',
			});
		}


		// Log the suspension request
		const newLog = {
			userId: userId,
			subscriptionId: subscriptionId,
			isCouponApplied: logData.isCouponApplied,
			couponCode: logData.couponCode,
			baseBillingPlanId: logData.baseBillingPlanId,
			planName: logData.planName,
			status: `${message === "downgrade" ? "Down Grade processed! changes take effect accordingly" : `${message} request saved to the queue`}`,
		};

		const logNew = await userPaymentLogs.create(newLog);
		if (!logNew) {
			return res.status(500).json({
				success: false,
				status: 500,
				message: 'Failed to save the log',
			});
		}

		return res.status(200).json({
			success: true,
			status: 200,
			message:
				`Request to ${message} subscription has been saved to the queue`,
		});
	} catch (error: any) {
		console.error('Error processing subscription pause request:', error);
		res.status(500).json({
			success: false,
			status: 500,
			message: 'Internal Server Error',
		});
	}
}



async function performPaypalSubscriptionPause(operationType: "suspend" | "cancel", subscriptionId: string) {
	const accessToken = await getPaypalAccessToken();
	try {
		if (operationType === "suspend") {
			return await suspendPaypalSubscription(subscriptionId, accessToken);

		} else if (operationType === "cancel") {
			return await cancelPaypalSubscription(subscriptionId, accessToken);
		} else {
			return {
				success: false,
				message: "Invalid operation type"
			};
		}
	} catch (error: any) {
		console.error(`Error performing PayPal subscription ${operationType}:`, error);
		return {
			success: false,
			message: `Failed to ${operationType} subscription: ${error.message}`
		};
	}
}

async function suspendPaypalSubscription(subscriptionId: string, accessToken: string) {
	const BASE_API_URL = process.env.PAYPAL_API_BASE_URL;
	try {
		await axios.post(`${BASE_API_URL}/v1/billing/subscriptions/${subscriptionId}/suspend`, {
			reason: "Requested by customer"
		}, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		const { data } = await axios.get(`${BASE_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});

		return {
			success: true,
			data
		};
	} catch (error: any) {
		console.error('Error suspending PayPal subscription:', error);
		return {
			success: false,
			message: `Failed to suspend subscription: ${error.message}`
		};
	}
}

async function cancelPaypalSubscription(subscriptionId: string, accessToken: string) {
	const BASE_API_URL = process.env.PAYPAL_API_BASE_URL;
	try {
		await axios.post(
			`${BASE_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
			{
				reason: 'Requested by customer',
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		);

		const { data } = await axios.get(
			`${BASE_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		);

		return {
			success: true,
			data
		};
	} catch (error: any) {
		console.error('Error canceling PayPal subscription:', error);
		return {
			success: false,
			message: `Failed to cancel subscription: ${error.message}`
		};
	}
}

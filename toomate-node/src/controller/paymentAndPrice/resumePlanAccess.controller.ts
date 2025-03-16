import { PaymentPlan } from '../../models/admin/paymentPlan.model.js';
import connectDB from '../../db/db.db.js';
import getPaypalAccessToken from '../../utils/paypalUtils.js';
import axios from 'axios';
import { Request, Response } from 'express';
import User from '../../models/user.model.js';
import { UserPayment } from '../../models/userPayment.model.js';
import updateSubscriptionQueue from '../../models/updateSubscriptionQueue.model.js';
import userPaymentLogs from '../../models/userPaymentLogs.model.js';

// this function is used to resume the plan access
// it will update the plan access and active plan in the user payment model
export async function resumePlanAccess(req: Request, res: Response) {
  await connectDB();
  try {
    const { userId, subscriptionId } = req.body;

    if (!userId || !subscriptionId) {
      return res.status(400).json({ message: 'User ID and Subscription ID are required' });
    }

    const data = await getSubscriptionData(subscriptionId);
    if (!data.success || data.data.status !== 'ACTIVE') {
      return res.status(404).json({
        message: 'Subscription not found Or Subscription is in active state',
        success: false,
        status: 404,
      });
    }

    const updateSubscriptionPlan = await updateTheSubscriptionPlan(subscriptionId);
    if (!updateSubscriptionPlan.success) {
      return res.status(500).json({
        message: 'Error updating subscription plan',
        success: false,
        status: 500,
      });
    }

    const newSubscriptionData = await getSubscriptionData(subscriptionId);
    if (!newSubscriptionData.success) {
      return res.status(500).json({
        message: 'Error fetching subscription details',
        success: false,
        status: 500,
      });
    }

    const newStatus = newSubscriptionData.data.status;
    if (newStatus !== 'ACTIVE') {
      return res.status(500).json({
        message: 'Subscription is not in active state',
        success: false,
        status: 500,
      });
    }

    // create new update subscription queue item

    const userLog = await userPaymentLogs.findOne({
      userId,
      subscriptionId,
      status: {
        $in: ["subscription ACTIVE", "ACTIVE"]
      },
    });

    if (!userLog) {
      return res.status(404).json({
        message: 'Subscription log not found',
        success: false,
        status: 404,
      });
    }

    let subIdToCheck = ""
    if (userLog.isCouponApplied || userLog.baseBillingPlanId) {
      subIdToCheck = userLog.baseBillingPlanId;
    }
    else {
      subIdToCheck = subscriptionId;
    }

    // get the plan access details
    const subDetails = await getSubscriptionData(subIdToCheck);
    if (!subDetails.success) {
      return res.status(500).json({
        message: 'Error fetching subscription details',
        success: false,
        status: 500,
      });
    }

    const planId = subDetails.data.plan_id;
    const accessDetails = await getAccessDetails(planId);
    if (!accessDetails.success) {
      return res.status(400).json({
        message: 'Invalid Plan ID',
        success: false,
        status: 400,
      });
    }

    const platformAccess = accessDetails.platformAccess;

    const newQueue = {
      userId,
      subscriptionId,
      type: 'resume',
      updatePlanAccessTo: platformAccess,
      updatePlanDate: subDetails.data.billing_info.next_billing_time,
    }

    const newItem = await updateSubscriptionQueue.create(newQueue);
    if (!newItem) {
      return res.status(500).json({
        message: 'Internal Server Error',
        success: false,
        status: 500,
      });
    }

    const newLog = {
      userId,
      subscriptionId,
      status: `Platform Access Changed to ${platformAccess === 1 ? 'Essential' : 'Standard'} Plan. Subscription RESUME`,
      baseBillingPlanId: userLog.baseBillingPlanId,
      planName: userLog.planName,
      isCouponApplied: userLog.isCouponApplied,
      couponCode: userLog.couponCode,
    }

    const log = await userPaymentLogs.create(newLog);
    if (!log) {
      return res.status(500).json({
        message: 'Internal Server Error. Failed to create log',
        success: false,
        status: 500,
      });
    }

    return res.status(200).json({
      message: 'Subscription plan updated successfully! changes will reflect on next billing cycle',
      success: true,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function getAccessDetails(planId: string) {
  const planData = await PaymentPlan.find().sort({ createdAt: -1 });
  if (!planData) {
    return {
      success: false,
      data: 'No plan found',
    };
  }
  const planDocument = planData[0];
  const essentialPlan = planDocument.essentialProductId;
  const standardPlan = planDocument.proProductId;
  if (!essentialPlan || !standardPlan) {
    return {
      success: false,
      data: 'No plan found',
    };
  }
  const planIds = [...essentialPlan, ...standardPlan];
  if (!planIds.includes(planId)) {
    return {
      success: false,
      data: 'Invalid Plan ID',
    };
  }

  const isEssential = essentialPlan.includes(planId);
  const isStandard = standardPlan.includes(planId);

  if (isEssential) {
    return {
      success: true,
      index: essentialPlan.indexOf(planId),
      platformAccess: 1,
    };
  }
  if (isStandard) {
    return {
      success: true,
      index: standardPlan.indexOf(planId),
      platformAccess: 2,
    };
  }
  return {
    success: false,
    data: 'Invalid Plan',
  };
}

async function getSubscriptionData(subscriptionId: string) {
  const accessToken = await getPaypalAccessToken();
  const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;
  try {
    const response = await axios.get(
      `${BASE_PAYPAL_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      data: `Error fetching subscription details: ${error.response?.data || error.message}`,
    };
  }
}

async function updateTheSubscriptionPlan(subscriptionId: string) {
  const accessToken = await getPaypalAccessToken();
  const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;
  try {
    const response = await axios.post(
      `${BASE_PAYPAL_URL}/v1/billing/subscriptions/${subscriptionId}/activate`,
      {
        reason: 'Requested by customer',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    if (response.status !== 200) {
      return { success: false, data: null };
    }
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error updating subscription plan:', error.message);
    return { success: false, data: null };
  }
}

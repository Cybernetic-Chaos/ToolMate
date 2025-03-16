import { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import connectDB from '../../db/db.db.js';
import { PaymentPlan } from '../../models/admin/paymentPlan.model.js';
import User from '../../models/user.model.js';
import PaymentSession from '../../models/paymentSession.model.js';
import CouponCode from '../../models/admin/couponCode.model.js';
import { UserPayment } from '../../models/userPayment.model.js';
import getPaypalAccessToken from '../../utils/paypalUtils.js';
import updateSubscriptionQueue from '../../models/updateSubscriptionQueue.model.js';
import OverDueList from '../../models/OverDueList.model.js';

dotenv.config();

class PaymentProcessor {
  private readonly baseUrl: string;
  private cachedToken: { token: string; expires: number } | null = null;

  constructor() {
    this.baseUrl = process.env.PAYPAL_API_BASE_URL || '';
    this.handlePayment = this.handlePayment.bind(this);
    this.checkSubscription = this.checkSubscription.bind(this);
  }


  // Fetch product data with error handling
  private async getProductData(productId: string): Promise<any> {
    const token = await getPaypalAccessToken();
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/v1/billing/plans/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error(`Product data fetch error for ${productId}:`, error.message);
      throw new Error('Failed to fetch product data');
    }
  }

  // Create billing plan with optimized structure
  private async createBillingPlan(params: {
    baseProductId: string;
    discountPercentage: number;
    firstBillingCycleOnly: boolean;
    isAbsoluteValueAsDiscount?: boolean;
    absoluteValueDiscount?: number;
  }): Promise<any> {
    const productData = await this.getProductData(params.baseProductId);
    const regularCycle = productData.billing_cycles.find(
      (cycle: any) => cycle.tenure_type === 'REGULAR' && cycle.pricing_scheme?.fixed_price
    );

    if (!regularCycle) {
      throw new Error('No regular billing cycle found');
    }

    const calculatePrice = (price: number) =>
      (price * (1 - params.discountPercentage / 100)).toFixed(2);

    const billingCycles = [];

    // Add trial/discounted cycle if needed
    if (params.firstBillingCycleOnly) {
      const discountedPrice = params.isAbsoluteValueAsDiscount
        ? String(params.absoluteValueDiscount)
        : calculatePrice(parseFloat(regularCycle.pricing_scheme.fixed_price.value));

      billingCycles.push({
        frequency: regularCycle.frequency,
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: 1,
        pricing_scheme: {
          fixed_price: {
            value: discountedPrice,
            currency_code: 'USD',
          },
        },
      });
    }

    // Add regular cycle
    billingCycles.push({
      frequency: regularCycle.frequency,
      tenure_type: 'REGULAR',
      sequence: params.firstBillingCycleOnly ? 2 : 1,
      total_cycles: 12,
      pricing_scheme: {
        fixed_price: {
          value: params.firstBillingCycleOnly
            ? regularCycle.pricing_scheme.fixed_price.value
            : calculatePrice(parseFloat(regularCycle.pricing_scheme.fixed_price.value)),
          currency_code: 'USD',
        },
      },
    });

    const token = await getPaypalAccessToken();
    const { data } = await axios.post(
      `${this.baseUrl}/v1/billing/plans`,
      {
        product_id: productData.product_id,
        name: productData.name,
        description: productData.description,
        billing_cycles: billingCycles,
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return data;
  }

  // Check subscription status with caching
  private async checkSubscription(userId: string): Promise<any> {
    const userPayment = await UserPayment.findOne({ userId }).lean();
    if (!userPayment?.activePlan) {
      return { success: false, isSubscribed: false, message: 'No active plan' };
    }

    try {
      const token = await getPaypalAccessToken();
      const { data } = await axios.get(
        `${this.baseUrl}/v1/billing/subscriptions/${userPayment.activePlan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const isActive = new Date(data.billing_info.next_billing_time) > new Date()
        && data.status === 'ACTIVE';

      return {
        success: true,
        isSubscribed: isActive,
        subscriptionId: userPayment.activePlan,
        message: isActive ? 'Active subscription found' : 'Subscription expired',
        data: isActive ? data : null,
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      return { success: false, isSubscribed: false, message: 'Error checking subscription' };
    }
  }

  // Calculate proration
  private calculateProration(
    currentPrice: number,
    newPrice: number,
    daysRemaining: number,
    totalDays: number
  ): number {
    const dailyDiff = (newPrice - currentPrice) / totalDays;
    return Number((dailyDiff * daysRemaining).toFixed(2));
  }

  // Main payment handler
  public async handlePayment(req: Request, res: Response): Promise<Response> {
    await connectDB();
    try {
      const { productId, userId, isCouponCodeApplied, CouponCode: couponInput, planName } = req.body;


      // remove the previous overDue or subscription pause request

      await Promise.all([
        updateSubscriptionQueue.deleteMany({ userId }),
        OverDueList.deleteMany({ userId })
      ]);


      // Validate basic requirements
      if (!productId || !userId) {
        return res.status(400).json({ message: 'Product ID and User ID are required' });
      }

      // Parallel data fetching
      const [user, paymentPlan, subscription] = await Promise.all([
        User.findById(userId).lean(),
        PaymentPlan.findOne().lean(),
        this.checkSubscription(userId),
      ]);

      if (!user || !paymentPlan?.essentialProductId || !paymentPlan?.proProductId) {
        return res.status(404).json({ message: 'Invalid user or payment plan' });
      }

      const isEssential = paymentPlan.essentialProductId.includes(productId);
      const isPro = paymentPlan.proProductId.includes(productId);
      if (!isEssential && !isPro) {
        return res.status(404).json({ message: 'Invalid product' });
      }

      let finalProductId = productId;
      let baseProductId: string | null = null;
      let couponCodeId: string | null = null;

      // Handle coupon logic
      if (isCouponCodeApplied) {
        if (subscription.isSubscribed) {
          return res.status(400).json({ message: 'Coupons not allowed for existing plan' });
        }

        const coupon = await CouponCode.findOne({
          code: couponInput,
          isActive: true,
          expiryDate: { $gte: Date.now() },
          limit: { $gt: 0 },
        }).lean();

        if (!coupon) {
          return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        const discountedPlan = await this.createBillingPlan({
          baseProductId: productId,
          discountPercentage: coupon.discountPercentage,
          firstBillingCycleOnly: coupon.firstBillingCycleOnly,
        });

        finalProductId = discountedPlan.id;
        baseProductId = productId;
        couponCodeId = String(coupon._id);
      }

      // Handle prorated upgrades
      if (subscription.isSubscribed) {
        const [currentPlan, newPlan] = await Promise.all([
          this.getProductData(subscription.data.plan_id),
          this.getProductData(productId),
        ]);

        const daysRemaining = Math.ceil(
          (new Date(subscription.data.billing_info.next_billing_time).getTime() -
            new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        // get the price user have currently paid 



        const prorationPrice = this.calculateProration(
          parseFloat(currentPlan.billing_cycles.find((cycle: any) => cycle.tenure_type === "REGULAR").pricing_scheme.fixed_price.value),
          parseFloat(newPlan.billing_cycles.find((cycle: any) => cycle.tenure_type == "REGULAR").pricing_scheme.fixed_price.value),
          daysRemaining,
          30 // Assuming monthly billing
        );

        const proratedPlan = await this.createBillingPlan({
          baseProductId: productId,
          discountPercentage: 0,
          firstBillingCycleOnly: true,
          isAbsoluteValueAsDiscount: true,
          absoluteValueDiscount: prorationPrice,
        });

        finalProductId = proratedPlan.id;
        baseProductId = productId;
      }

      // Create subscription
      const token = await getPaypalAccessToken();
      const { data } = await axios.post(
        `${this.baseUrl}/v1/billing/subscriptions`,
        {
          plan_id: finalProductId,
          subscriber: {
            name: { given_name: user.firstName, surname: user.lastName },
            email_address: user.email,
          },
          application_context: {
            brand_name: process.env.BRAND_NAME || 'Your Brand',
            locale: 'en-US',
            user_action: 'SUBSCRIBE_NOW',
            return_url: process.env.PAYPAL_SUCCESS_REDIRECT_URL,
            cancel_url: process.env.PAYPAL_CANCEL_REDIRECT_URL,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const approvalLink = data.links?.find((link: any) => link.rel === 'approve')?.href;
      if (!approvalLink) {
        return res.status(400).json({ message: 'Failed to generate approval link' });
      }

      // Create payment session
      await PaymentSession.create({
        ba: new URL(approvalLink).searchParams.get('ba_token'),
        planName,
        planAcccesToBeGranted: isEssential ? 1 : isPro ? 2 : 0,
        baseBillingPlanId: baseProductId,
        couponCodeId,
      });

      return res.status(200).json({ url: approvalLink, message: 'Redirect to PayPal' });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return res.status(500).json({ message: 'Payment processing failed' });
    }
  }
}

// Export singleton instance
export const paymentProcessor = new PaymentProcessor();
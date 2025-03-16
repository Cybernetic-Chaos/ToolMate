import connectDB from "../../../db/db.db.js";
import dotenv from "dotenv";
import { PaymentPlan } from "../../../models/admin/paymentPlan.model.js";
import getPaypalAccessToken from "../../../utils/paypalUtils.js";
import axios from "axios";
import { Request, Response } from "express";
import { AccessToken, PaymentData, Plan, PriceDetails, ProductResponse } from "../../../types/types.js";

dotenv.config();

// Function to create a product
async function createProduct(name: string, description: string, accessToken: AccessToken): Promise<string> {
    const url = `${process.env.PAYPAL_API_BASE_URL}/v1/catalogs/products`;

    const body = {
        name,
        description,
        type: "SERVICE",
        category: "SOFTWARE",
    };

    try {
        const response = await axios.post<ProductResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Product created:", response.data);
        return response.data.id;
    } catch (error: any) {
        console.error("Error creating product:", error.response?.data || error.message);
        throw new Error("Failed to create product");
    }
}

// Main function to create billing plans
export async function createDefaultBillingPlan(req: any, res: any) {
    try {
        console.clear();
        console.log("Starting createDefaultBillingPlan function");

        await connectDB();
        const accessToken: AccessToken = await getPaypalAccessToken();

        const paymentData = await PaymentPlan.findOne();
        if (!paymentData) {
            return res.status(404).json({ message: "No payment plans found" });
        }

        console.log("Payment data retrieved:", paymentData);

        const calculateDiscount = (price: number, months: number, discount: number) =>
            price * months * (1 - discount / 100);

        const prices: Record<string, PriceDetails> = {
            essential: {
                monthly: paymentData.essntialPrice,
                sixMonth: calculateDiscount(paymentData.essntialPrice, 6, paymentData.discountOnSixMonth),
                yearly: calculateDiscount(paymentData.essntialPrice, 12, paymentData.discountOnYearly),
            },
            pro: {
                monthly: paymentData.proPrice,
                sixMonth: calculateDiscount(paymentData.proPrice, 6, paymentData.discountOnSixMonth),
                yearly: calculateDiscount(paymentData.proPrice, 12, paymentData.discountOnYearly),
            },
        };

        const plans: Plan[] = [
            {
                name: "Essential Monthly Plan",
                description: "Basic plan with 1-month billing cycle",
                price: prices.essential.monthly,
                frequency: "MONTH",
                intervalCount: 1,
                planType: "ESSENTIAL",
            },
            {
                name: "Essential 6-Month Plan",
                description: "Basic plan with 6-month billing cycle",
                price: prices.essential.sixMonth,
                frequency: "MONTH",
                intervalCount: 6,
                planType: "ESSENTIAL",
            },
            {
                name: "Essential Yearly Plan",
                description: "Basic plan with 1-year billing cycle",
                price: prices.essential.yearly,
                frequency: "MONTH",
                intervalCount: 12,
                planType: "ESSENTIAL",
            },
            {
                name: "Pro Monthly Plan",
                description: "Pro plan with 1-month billing cycle",
                price: prices.pro.monthly,
                frequency: "MONTH",
                intervalCount: 1,
                planType: "PRO",
            },
            {
                name: "Pro 6-Month Plan",
                description: "Pro plan with 6-month billing cycle",
                price: prices.pro.sixMonth,
                frequency: "MONTH",
                intervalCount: 6,
                planType: "PRO",
            },
            {
                name: "Pro Yearly Plan",
                description: "Pro plan with 1-year billing cycle",
                price: prices.pro.yearly,
                frequency: "MONTH",
                intervalCount: 12,
                planType: "PRO",
            },
        ];

        const productId = await createProduct(
            "Software Subscription",
            "Unified product for all subscription plans",
            accessToken
        );

        const billingPlans = await createBillingPlans(
            plans.map((plan) => ({
                ...plan,
                productId: productId,
            })),
            accessToken
        );

        console.log("after adding billing plans:", billingPlans);
        if (billingPlans.length === 0) {
            return res.status(500).json({ message: "Failed to create billing plans" });
        }
        const essential_productId = [];
        const pro_productId = [];
        console.dir(billingPlans);
        for (const plan of billingPlans) {
            if (plan.type === "ESSENTIAL") {
                essential_productId.push(plan.plan.id);
            } else {
                pro_productId.push(plan.plan.id);
            }
        }

        console.log("Essential Product Ids:", essential_productId, "Pro Product Ids:", pro_productId);
        paymentData.essentialProductId = essential_productId; // 0 > essential 1 month, 1 > essential 6 month, 2 > essential 1 year
        paymentData.proProductId = pro_productId; // 0 > pro 1 month, 1 > pro 6 month, 3 > pro 1 year
        const updatedPayment = await paymentData.save();
        if (!updatedPayment) {
            return res.status(500).json({ message: "Failed to update payment plans" });
        }
        // const activatedPlans = await Promise.all(
        //     billingPlans.map((plan) => activateBillingPlan(plan.id, accessToken))
        // );

        console.log("All billing plans created and activated successfully");
        return res.status(200).json({
            message: "Billing plans created,activated and saved successfully",
            data: billingPlans,
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


async function createBillingPlans(plans: {
    name: string;
    description: string;
    price: number;
    frequency: string;
    intervalCount: number;
    planType: string;
    productId: string;
}[], accessToken: string) {
    const url = `${process.env.PAYPAL_API_BASE_URL}/v1/billing/plans`;
    const billingPlans = [];

    for (const plan of plans) {
        const body = {
            product_id: plan.productId,
            name: plan.name,
            description: plan.description,
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: plan.frequency,
                        interval_count: plan.intervalCount,
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: {
                            value: plan.price.toFixed(2),
                            currency_code: "USD",
                        },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3,
            },
        };

        for (let i = 0; i < 2; i++) {
            try {
                const response = await axios.post(url, body, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });
                console.log("Billing plan created:", response.data);
                billingPlans.push({
                    type: plan.planType,
                    plan: response.data,
                });
                break;
            } catch (error: any) {
                console.error("Error creating billing plan:", error.response?.data || error.message);
                if (error.response?.status === 401) {
                    accessToken = await getPaypalAccessToken();
                }
            }
        }
    }

    return billingPlans;
}

// async function activateBillingPlan(planId:string, accessToken:string) {
//     const url = `${process.env.PAYPAL_API_BASE_URL}/v1/billing/plans/${planId}`;
//     try {
//         const response = await axios.patch(
//             url,
//             [{ op: "replace", path: "/", value: { state: "ACTIVE" } }],
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );
//         console.log("Billing plan activated:", response.data);
//         return response.data;
//     } catch (error:any) {
//         console.error("Error activating billing plan:", error.response?.data || error.message);
//         return null;
//     }
// }

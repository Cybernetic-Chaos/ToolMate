import connectDB from '../../../db/db.db.js';
import userRefundLogs from '../../../models/userRefundLogs.model.js';
import getPaypalAccessToken from '../../../utils/paypalUtils.js';
import axios from 'axios';
import { Request, Response } from 'express';
import pLimit from 'p-limit';

// Constants
const BASE_PAYPAL_URL = process.env.PAYPAL_API_BASE_URL;
const CONCURRENCY_LIMIT = 5; // Number of concurrent PayPal requests

interface RefundDetails {
    id: string;
    status: string;
    amount: string;
    createdAt: string;
    seller_payable_breakdown: {
        gross_amount: string;
        paypal_fee: string;
        platform_fees: { amount: string; payee: string }[];
        net_amount: string;
        total_refunded_amount: string;
    };
}

interface RefundLog {
    refundId: string;
    [key: string]: any;
}

/**
 * Fetches refund details from PayPal using the refund ID.
 */
async function getRefundDetailsFromPayPal(
    refundId: string,
    accessToken: string
): Promise<{ success: boolean; data: RefundDetails | string }> {
    try {
        const response = await axios.get(
            `${BASE_PAYPAL_URL}/v2/payments/refunds/${refundId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const { id, amount, status, create_time, seller_payable_breakdown } = response.data;

        return {
            success: true,
            data: {
                id,
                status,
                amount: `${amount.value} ${amount.currency_code}`,
                createdAt: new Date(create_time).toLocaleString(),
                seller_payable_breakdown,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            data: `Failed to fetch refund details: ${error.response?.data || error.message}`,
        };
    }
}

/**
 * Fetches refund logs for a user and retrieves details from PayPal for each refund.
 */
export async function getRefundLogs(req: Request, res: Response) {
    await connectDB();

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Fetch refund logs from the database
        const refundLogs = await userRefundLogs.find({ userId }).sort({ createdAt: -1 });

        if (refundLogs.length === 0) {
            return res.status(404).json({ message: 'No refund logs found.' });
        }

        // Get PayPal access token (cache it for efficiency)
        const accessToken = await getPaypalAccessToken();
        if (!accessToken) {
            return res.status(500).json({ message: 'Failed to retrieve PayPal access token.' });
        }

        // Limit concurrent requests to PayPal
        const limit = pLimit(CONCURRENCY_LIMIT);
        const refundDetails = await Promise.all(
            refundLogs.map(log =>
                limit(() => getRefundDetailsFromPayPal(log.refundId, accessToken))
            )
        );

        const results = refundDetails.map((result: { success: boolean; data: RefundDetails | string }, index: number) =>
            result.success
                ? result.data
                : { refundId: refundLogs[index].refundId, error: result.data }
        );

        return res.status(200).json({ logs: results });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}

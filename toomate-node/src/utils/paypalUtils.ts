import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

let lastTokenRefreshed: number | null = null; // Store the last refreshed timestamp (in seconds)
let accessToken: string = "";       // Store the access token

const TOKEN_VALIDITY_IN_SECONDS = 8 * 60 * 60; // 8 hours (28,800 seconds)
const REFRESH_THRESHOLD_IN_SECONDS = 7 * 60 * 60; // 7 hours (25,200 seconds)

// Function to fetch a new access token (dummy example; replace with actual implementation)
async function fetchNewAccessToken() {
    // Example implementation to get a new access token
    console.log(process.env.PAYPAL_API_BASE_URL, "process.env.PAYPAL_API_BASE_URL", process.env.PAYPAL_CLIENT_ID, "process.env.PAYPAL_CLIENT_ID", process.env.PAYPAL_CLIENT_SECRET, "process.env.PAYPAL_CLIENT_SECRET");
    const response = await axios.post(
        `${process.env.PAYPAL_API_BASE_URL}/v1/oauth2/token`, // Replace with your live/production API URL for PayPal
        'grant_type=client_credentials', // Data for the POST request
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Required header
            },
            auth: {
                username: process.env.PAYPAL_CLIENT_ID!, // Your PayPal client ID from environment variables
                password: process.env.PAYPAL_CLIENT_SECRET!, // Your PayPal client secret from environment variables
            },
        },
    );
    console.log('Access token response:', response.data);
    return {
        token: response.data.access_token,
        expires_in: response.data.expires_in,
    };
}

// Function to get a fresh or valid access token
export default async function getPaypalAccessToken() {

    const currTimeInSec = Math.floor(Date.now() / 1000); // Current time in seconds

    // If no token has been fetched yet or the refresh threshold has been crossed
    if (
        !lastTokenRefreshed || // Token has never been fetched
        currTimeInSec - lastTokenRefreshed >= REFRESH_THRESHOLD_IN_SECONDS // Past the 7-hour mark
    ) {
        console.log("Fetching a new access token...");

        const newTokenDetails = await fetchNewAccessToken();
        accessToken = newTokenDetails.token;
        lastTokenRefreshed = currTimeInSec;

        console.log("Access token refreshed.");
    } else {
        console.log("Returning existing access token.");
    }

    return accessToken; // Return the valid token
}


export async function getSubscriptionDetails(subscriptionId: string) {
    const accessToken = await getPaypalAccessToken();
    try {
        const response = await axios.get(
            `${process.env.PAYPAL_API_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, data: `Error fetching subscription details: ${error.response?.data || error.message}` };
    }
}

export function getPaypalFormatDate() {
    const currentDate = new Date().toISOString().split('.')[0] + 'Z';
    return currentDate;
}
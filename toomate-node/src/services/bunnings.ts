import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

// Interfaces
interface IBunningsSearchItem {
    title: string;
    itemNumber: string;
    _meta: {
        countryCode: string;
        itemNumber: string;
    };
    _links: {
        rel: string;
        href: string;
        methods: string[];
    }[];
}

interface IBunningsSearchResponse {
    query: string;
    results: IBunningsSearchItem[];
}

interface IPriceDetail {
    itemNumber: string;
    unitPrice: number;
    lineUnitPrice: number;
}

// Initialize cache
const tokenCache = new NodeCache({ stdTTL: 50 * 60 }); // 50 minutes TTL

// Rate limiting and queue mechanism
const MAX_PRODUCT_PICK = 3;
const MAX_CONCURRENT_REQUESTS = 2;

// limit number of concurrent requests
const limit = pLimit(MAX_CONCURRENT_REQUESTS); // Increased concurrency

// Helper: Make API Request
const makeRequest = async <T>(
    url: string,
    method: 'GET' | 'POST',
    headers: Record<string, string>,
    data?: any
): Promise<T | false> => {
    try {
        const response = await axios({ method, url, headers, data });
        return response.data;
    } catch (error: any) {
        console.error('API Request Error:', { url, method, data, error: error.response?.data || error.message });
        throw error;
    }
};

// Fetch Access Token
const getBunningsAccessToken = async (): Promise<string> => {
    const cachedToken = tokenCache.get<string>('accessToken');
    if (cachedToken) return cachedToken;

    const response = await makeRequest<{ access_token: string }>(
        `${process.env.BUNNINGS_AUTH_API_URL}/connect/token`,
        'POST',
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        new URLSearchParams({
            client_id: process.env.BUNNINGS_CLIENT_ID!,
            client_secret: process.env.BUNNINGS_CLIENT_SECRET!,
            grant_type: 'client_credentials',
        })
    );

    if (response) {
        tokenCache.set('accessToken', response.access_token);
        return response.access_token;
    }
    throw new Error('Failed to fetch access token');
};

// Retry Logic
export const retry = async <T>(fn: () => Promise<T>, retries: number = 3): Promise<T> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries - 1) throw error;
        }
    }
    throw new Error('Max retries reached');
};

// Fetch Item Details
export const getItemDetails = async (itemNumbers: { query: string; results: string[] }[]) => {
    const url = `${process.env.BUNNINGS_ITEM_API_URL}/detail/AU`;
    const headers = {
        Authorization: `Bearer ${await getBunningsAccessToken()}`,
        'Content-Type': 'application/json',
        'x-version-api': '1.4',
    };

    const itemDetailsMap: Record<string, any> = {};

    await Promise.allSettled(
        itemNumbers.flatMap((item) =>
            item.results.map((itemNumber) =>
                limit(async () => {
                    try {
                        const response = await makeRequest(`${url}/${itemNumber}`, 'GET', headers);
                        if (response) {
                            itemDetailsMap[itemNumber] = response;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch details for item number ${itemNumber}:`, error);
                    }
                })
            )
        )
    );
    console.log(itemDetailsMap, "itemDetailsMap")
    return itemNumbers.map((item) => ({
        query: item.query,
        results: item.results.map((itemNumber) => itemDetailsMap[itemNumber] || null).filter(Boolean),
    }));
};

// Fetch Price Details
export const getPriceDetails = async (itemNumbers: string[], locationCode: string = '6395'): Promise<IPriceDetail[]> => {
    const url = `${process.env.BUNNINGS_PRICE_API_URL}/catalog/prices`;
    const headers = {
        Authorization: `Bearer ${await getBunningsAccessToken()}`,
        'Content-Type': 'application/json',
        'x-version-api': '1.0',
    };

    const requestBody = {
        context: { country: 'AU', location: locationCode },
        items: itemNumbers.map((itemNumber) => ({ itemNumber })),
    };

    const response = await makeRequest<{ prices: IPriceDetail[] }>(url, 'POST', headers, requestBody);
    return response ? response.prices.filter((item) => item.unitPrice !== null) : [];
};

// Search Products
export const searchBunningsProducts = async (
    searchTerms: string[],
    isBudgetApplied: boolean,
    minBudget: number,
    maxBudget: number,
    locationCode: string = '6395',
) => {
   
    if (searchTerms.length === 0) {
        return { success: true, data: 'No search terms provided' };
    }

    if (
        isBudgetApplied &&
        (minBudget < 0 || maxBudget < 1 || minBudget > maxBudget)
    ) {
        return { success: false, message: 'Invalid budget range' };
    }

    const url = `${process.env.BUNNINGS_ITEM_API_URL}/search/AU`;
    const headers = {
        Authorization: `Bearer ${await getBunningsAccessToken()}`,
        'Content-Type': 'application/json',
        'x-version-api': '1.4',
    };

    const searchResults = await Promise.allSettled(
        searchTerms.map((query) =>
            limit(async () => {
                const reqBody = {
                    query,
                    filters: {
                        facets: [
                            {
                                id: `price_${locationCode}`,
                                startRange: isBudgetApplied ? minBudget : 0,
                                endRange: isBudgetApplied ? maxBudget : 999999,
                            },
                        ],
                        locationCode,
                    },
                    sortBy: 'relevancy',
                };
                const response = await makeRequest<IBunningsSearchResponse>(
                    url,
                    'POST',
                    headers,
                    reqBody
                );
                return response ? { query, results: response.results } : { query, results: [] };
            })
        )
    );

    const validResults = searchResults
        .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled' && res.value.results.length > 0)
        .map((res) => res.value);

    const itemMap = validResults
        .map((res) => ({
            query: res.query,
            results: res.results.slice(0, res.results.length > 5 ? MAX_PRODUCT_PICK : res.results.length).map((item: any) => item.itemNumber).filter(Boolean),
        }));
    console.log(itemMap, "itemMap")
    const uniqueItemNumbers = Array.from(
        new Set(validResults.flatMap((res) => res.results.map((item: any) => item.itemNumber)))
    );

    const [priceDetails, itemDetails] = await Promise.all([
        retry(() => getPriceDetails(uniqueItemNumbers, locationCode)),
        retry(() => getItemDetails(itemMap)),
    ]);

    const priceMap = new Map(priceDetails.map((price) => [price.itemNumber, price]));

    const returnData = itemDetails
        .map((item) => ({
            query: item.query,
            results: item.results
                .filter((result) => result.itemNumber && result.enrichedData && result.enrichedData.name)
                .map((result) => {
                    console.log(result, "result")
                    const priceDetail = priceMap.get(result.itemNumber) || { unitPrice: 0, lineUnitPrice: 0 };
                    const url = (result.enrichedData?.modelName && result.enrichedData.modelNumber) ?
                        `${process.env.BUNNINGS_PUBLIC_URL}/${String(result.enrichedData.modelName).toLowerCase().replace(/\s+/g, "-")}-${result.enrichedData.modelNumber}_p${result.itemNumber}` :
                        `${process.env.BUNNINGS_PUBLIC_URL}/${String(result.enrichedData.modelName).toLowerCase().replace(/\s+/g, "-")}-_p${result.enrichedData.itemNumber}`;
                    return {
                        itemNumber: result.itemNumber,
                        title: result.enrichedData?.name || '',
                        description: result.enrichedData?.description || '',
                        brand: result.enrichedData?.brand?.name || '',
                        leadingBrand: result.enrichedData?.brand?.leadingBrand || false,
                        newArrival: result.enrichedData?.newArrivalFlag || false,
                        bestSeller: result.enrichedData?.bestSellerFlag || false,
                        heroImage: result.enrichedData?.picture?.primaryAssetURL || '',
                        otherImages: result.enrichedData?.otherImages?.map((img: any) => img.primaryAssetURL) || [],
                        keySellingPoints: result.enrichedData?.keySellingPoints || [],
                        microSellingPoints: result.enrichedData?.microSiteKeySellingPoint || [],
                        price: {
                            itemNumber: result.itemNumber,
                            unitPrice: priceDetail.unitPrice || 0,
                            lineUnitPrice: priceDetail.lineUnitPrice || 0
                        },
                        url: url,
                    };
                })
        }))
        .filter((item) => item.results.length > 0);

    const formatedData = returnData.map((item) => {
        return {
            categoryName: item.query,
            products: item.results,
        }
    })

    const dbItemMap = formatedData.map(
        (item) => {
            return {
                categoryName: item.categoryName,
                products: item.products.map((product) => product.itemNumber)
            }
        }
    )
    return { success: true, data: formatedData, itemMap: dbItemMap };
};


export async function getLocationCodeByLagAndLog(lat: number, log: number) {
    const url = `${process.env.BUNNINGS_LOCATION_API_URL}/locations/nearest`;
    const headers = {
        Authorization: `Bearer ${await getBunningsAccessToken()}`,
        'Content-Type': 'application/json',
        'x-version-api': '1.0',
    };

    const response = await axios.get(
        `${url}/locations/nearest?latitude=${lat}&longitude=${log}&$skip=0&$top=5`,
        { headers }
    );

    if (!response.data || response.data.locations.length <= 0 || response.data.error) {
        return {
            success: false,
            message: response.data.error || "No location found",
        }
    }

    return {
        success: false,
        locationCode: response.data.locations[0].locationCode,
        locationName: response.data.locations[0].name,
    }
}


export async function getFullLocationDetails(lat: number, log: number) {
    const url = `${process.env.BUNNINGS_ITEM_API_URL}/store/AU`;
    const headers = {
        Authorization: `Bearer ${await getBunningsAccessToken()}`,
        'Content-Type': 'application/json',
        'x-version-api': '1.0',
    };
    const res = await axios.get(
        `${url}/store/AU?latitude=${lat}&longitude=${log}&$skip=0&$top=5`,
        { headers }
    );

    if (!res.data || res.data.error) {
        return {
            success: false,
            message: res.data.error || "No location found",
        }
    }
    const newData = res.data.locations.map((location: any) => {
        return {
            locationCode: location.locationCode,
            name: location.name,
            address: location.address,
            phone: location.phone,
            email: location.email,
            friendlyName: location.friendlyName,
        }
    });
    return {
        success: true,
        data: newData,
    }


}

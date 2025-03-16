import { Request, Response } from 'express';
import { getItemDetails, getPriceDetails, retry } from '../../services/bunnings.js';

interface Iitem {
    categoryName: string;
    products: string[];
}

type IitemMap = Iitem[];

// Type guard to check if data matches IitemMap
const isIitemMapArray = (data: any): data is IitemMap =>
    Array.isArray(data) &&
    data.every(
        (item) =>
            item &&
            typeof item.categoryName === "string" &&
            Array.isArray(item.products) &&
            item.products.every((product: any) => typeof product === "string")
    );

export const getBunnginsProductDetails = async (req: Request, res: Response) => {
    try {
        const { itemMap, locationCode }: { itemMap: IitemMap, locationCode: string | null } = req.body;

        if (!itemMap || !isIitemMapArray(itemMap)) {
            return res.status(400).json({ message: "Invalid itemMap data" });
        }

        const newItemMap = itemMap.map(({ categoryName, products }) => ({
            query: categoryName,
            results: products
        }));
        console.log(newItemMap, "newItemMap");
        const uniqueItemNumbers = [...new Set(itemMap.flatMap(({ products }) => products))];

        const [priceDetails, itemDetails] = await Promise.all([
            retry(() => getPriceDetails(uniqueItemNumbers, locationCode ? locationCode : undefined)),
            retry(() => getItemDetails(newItemMap)),
        ]);

        const priceMap = new Map(priceDetails.map((price) => [price.itemNumber, price]));

        const returnData = itemDetails
            .map((item) => ({
                categoryName: item.query,
                products: item.results
                    .filter((result) => result.itemNumber && result.enrichedData && result.enrichedData.name)
                    .map((result) => {
                        console.log(result, "result");
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
            .filter((item) => item.products.length > 0);

        return res.status(200).json({ message: "Success", data: returnData });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


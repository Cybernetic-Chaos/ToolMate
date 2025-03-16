import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

import { pricing } from '@/constants';
import { useToast } from '@/hooks/use-toast';

// Create context
const PriceContext = createContext({
    priceData: [],
    isPriceLoading: true,
    sixMonthDiscount: 0,
    yearlyDiscount: 0
});

// Custom hook to use the price context
export const usePriceContext = () => {
    const context = useContext(PriceContext);
    if (!context) {
        throw new Error('usePriceContext must be used within a PriceProvider');
    }
    return context;
};

export const PriceProvider = ({ children }: {
    children: React.ReactNode;
}) => {
    const [priceData, setPriceData] = useState([]);
    const [isPriceLoading, setIsPriceLoading] = useState(true);
    const [sixMonthDiscount, setSixMonthDiscount] = useState(0);
    const [yearlyDiscount, setYearlyDiscount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchPriceData() {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/getCurrPrice`);
                const { month, sixMonth, year, discountOnSixMonth, discountOnYearly, productId } = data;
                setSixMonthDiscount(discountOnSixMonth);
                setYearlyDiscount(discountOnYearly);

                const newPriceData = pricing.map((priceItem) => {
                    if (priceItem.tabName === "month") {
                        priceItem.list[1].priceSetter = { price: month[0] };
                        priceItem.list[2].priceSetter = { price: month[1] };
                        priceItem.list[1].productIdSetter = productId.month[0];
                        priceItem.list[2].productIdSetter = productId.month[1];
                    }
                    if (priceItem.tabName === "months") {
                        priceItem.list[1].priceSetter = { price: sixMonth[0], discount: discountOnSixMonth };
                        priceItem.list[2].priceSetter = { price: sixMonth[1], discount: discountOnSixMonth };
                        priceItem.list[1].productIdSetter = productId.sixMonth[0];
                        priceItem.list[2].productIdSetter = productId.sixMonth[1];
                    }
                    if (priceItem.tabName === "year") {
                        priceItem.list[1].priceSetter = { price: year[0], discount: discountOnYearly };
                        priceItem.list[2].priceSetter = { price: year[1], discount: discountOnYearly };
                        priceItem.list[1].productIdSetter = productId.year[0];
                        priceItem.list[2].productIdSetter = productId.year[1];
                    }
                    return priceItem;
                });

                setPriceData(newPriceData);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch price data",
                    variant: "destructive",
                });
            } finally {
                setIsPriceLoading(false);
            }
        }
        fetchPriceData();
    }, []);

    const value = {
        priceData,
        isPriceLoading,
        sixMonthDiscount,
        yearlyDiscount
    };

    return (
        <PriceContext.Provider value={value}>
            {children}
        </PriceContext.Provider>
    );
};

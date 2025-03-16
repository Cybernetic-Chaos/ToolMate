import { RightSidebarContext } from "@/context/rightSidebarContext";
import { useContext, useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import classNames from "classnames";
import { getImageUrl } from "@/lib/utils";

export function VendorProduct({
    activeValue,
    setActiveValue,
}: {
    activeValue: string;
    setActiveValue: (value: string) => void;
}) {
    const { vendorProduct } = useContext(RightSidebarContext);
    const [currActiveCategory, setCurrActiveCategory] = useState<string>('');

    useEffect(() => {
        if (vendorProduct.length > 0 && !currActiveCategory) {
            setCurrActiveCategory(vendorProduct[0].categoryName);
        }
    }, [vendorProduct, currActiveCategory]);

    function extractAllProducts(data: any) {
        return data.flatMap((category: any) =>
            category.products.map((product: any) => ({
                ...product,
                categoryName: category.categoryName,
            }))
        );
    }

    const products = extractAllProducts(vendorProduct);
    const filteredProducts = currActiveCategory
        ? products.filter((product: any) => product.categoryName === currActiveCategory)
        : products;
    console.log('filteredProducts', filteredProducts);
    return (
        <div className="z-40 max-w-4xl">
            {/* Carousel for categories */}
            <Carousel className="h-full max-w-[95%]">
                <CarouselContent className="flex gap-2 px-4 py-2 border-b border-gray-200">
                    {vendorProduct.map((category: any, index: number) => (
                        <CarouselItem key={index} className="w-fit basis-auto">
                            <button
                                className={classNames(
                                    "px-4 py-2 rounded-lg font-semibold text-[5px] transition-colors duration-300",
                                    {
                                        "bg-lighterYellow ": category.categoryName === currActiveCategory,
                                        "bg-gray-200 text-gray-700": category.categoryName !== currActiveCategory,
                                    }
                                )}
                                onClick={() => setCurrActiveCategory(category.categoryName)}
                            >
                                {category.categoryName}
                            </button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="w-full h-10 relative flex justify-between items-center p-4">
                    <CarouselPrevious className="absolute left-4 bg-lighterYellow" />
                    <CarouselNext className="absolute left-14 bg-lighterYellow" />
                </div>
            </Carousel>

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {filteredProducts.map((product: any, index: number) => (
                    <div
                        key={product._id}
                        className="relative group cursor-pointer overflow-hidden border border-slate-300 rounded-lg"
                        onClick={() => setActiveValue(product._id)}
                    >
                        <img
                            src={getImageUrl(Array.isArray(product.imageParams) ? product.imageParams[0] : product.imageParams)}
                            onError={(e) => {
                                e.currentTarget.src = '/assets/images/no-image.svg';
                            }}
                            alt={product.name}
                            className={`w-full h-full object-cover ${activeValue === product._id ? "border-yellow shadow-lg border-2" : ""} group-hover:opacity-90 object-cover transition-opacity duration-300`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white font-semibold">
                            {product.name || 'No Name'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

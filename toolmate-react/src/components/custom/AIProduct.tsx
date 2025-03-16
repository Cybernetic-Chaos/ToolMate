import { RightSidebarContext } from "@/context/rightSidebarContext";
import { useContext, useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import classNames from "classnames";
export function AIProduct() {
    const { aiProduct } = useContext(RightSidebarContext);
    const [currActiveCategory, setCurrActiveCategory] = useState<string>('');

    useEffect(() => {
        if (aiProduct.length > 0 && !currActiveCategory) {
            setCurrActiveCategory(aiProduct[0].categoryName);
        }
    }, [aiProduct, currActiveCategory]);

    function extractAllProducts(data: any) {
        return data.flatMap((category: any) =>
            category.products.map((product: any) => ({
                ...product,
                categoryName: category.categoryName
            }))
        );
    }

    const products = extractAllProducts(aiProduct);

    const filteredProducts = currActiveCategory
        ? products.filter((product: any) => product.categoryName === currActiveCategory)
        : products;

    return (
        <div className="max-w-7xl">
            <Carousel className="h-full ">


                <CarouselContent className=" flex gap-2 px-4 py-2 border-b border-gray-200">

                    {
                        aiProduct.map((category: any, index: number) => {
                            return (
                                <CarouselItem className="w-fit basis-auto">
                                    <button
                                        key={index}
                                        className={classNames(
                                            "px-4 py-2 rounded-lg font-semibold text-[5px] transition-colors duration-300",
                                            {
                                                "bg-lighterYellow ": category.categoryName === currActiveCategory,
                                                "bg-gray-200 text-gray-700": category.categoryName !== currActiveCategory
                                            }
                                        )}
                                        onClick={() => setCurrActiveCategory(category.categoryName)}
                                    >
                                        {category.categoryName}
                                    </button>
                                </CarouselItem>


                            );
                        })
                    }
                </CarouselContent>
                <div className="w-full h-10 relative flex justify-between items-center p-4">
                    <CarouselPrevious className="absolute left-4 bg-lighterYellow" />
                    <CarouselNext className="absolute left-14 bg-lighterYellow" />
                </div>
            </Carousel>
            <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8 bg-gray-100">
                {filteredProducts.map((product: any, index: number) => (
                    <div
                        key={index}
                        className="cursor-pointer border border-slate-300 flex flex-col items-start text-left bg-white rounded-xl shadow-md p-6 transform transition-all hover:scale-105 hover:shadow-xl hover:bg-gray-50"
                    >
                        <p className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</p>
                        <p className="text-base text-gray-600 mb-4">{product.description}</p>
                        <p className="text-sm text-gray-700 mb-4">
                            <span className="font-semibold text-orange-500">Tip From Matey:</span>
                            <span className="text-gray-800 font-medium"> {product.personalUsage}</span>
                        </p>
                        <p className="text-sm font-semibold text-gray-500">Estimated: {product.price} AUD</p>
                    </div>
                ))}
            </div>

        </div>
    )
}
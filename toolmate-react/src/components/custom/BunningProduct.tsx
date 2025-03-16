import { RightSidebarContext } from "@/context/rightSidebarContext";
import classNames from "classnames";
import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export default function BunningProduct({
    activeValue,
    setActiveValue,
}: {
    activeValue: string;
    setActiveValue: (value: string) => void;
}) {
    const { bunningProduct } = useContext(RightSidebarContext);
    const [currActiveCategory, setCurrActiveCategory] = useState<string>('');

    useEffect(() => {
        if (bunningProduct.length > 0 && !currActiveCategory) {
            setCurrActiveCategory(bunningProduct[0].categoryName);
        }
    }, [bunningProduct, currActiveCategory]);

    function extractAllProducts(data: any) {
        return data.flatMap((category: any) =>
            category.products.map((product: any) => ({
                ...product,
                categoryName: category.categoryName
            }))
        );
    }

    const products = extractAllProducts(bunningProduct);

    const filteredProducts = currActiveCategory
        ? products.filter((product: any) => product.categoryName === currActiveCategory)
        : products;

    return (
        <div className="flex-1 h-full overflow-hidden w-screen md:max-w-4xl"> {/* Ensures container doesn’t exceed its bounds */}
            {/* // 33% of the carousel width. */}
            <Carousel className="h-full">


                <CarouselContent className=" flex gap-2 px-4 py-2 border-b border-gray-200">

                    {
                        bunningProduct.map((category: any, index: number) => {
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 -z-40">
                {
                    filteredProducts.map((item: any, index: number) => {
                        return (
                            <motion.div
                                key={index}
                                className={`relative group cursor-pointer overflow-hidden`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                onClick={() => setActiveValue(item._id)}
                            >
                                <img
                                    src={item.image || '/assets/images/no-image.svg'}
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/images/no-image.svg';
                                    }}
                                    className={`w-full h-full object-cover rounded-lg border border-slate-300 ${activeValue == item._id && "border-yellow shadow-lg border-2"}  overflow-hidden group-hover:opacity-90 transition-opacity duration-300`}
                                />
                                <div className="absolute inset-0  bg-black rounded-md p-4 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white  font-semibold">
                                    {item.name || 'No Name'} <br />
                                </div>
                            </motion.div>
                        );
                    })
                }
            </div>
        </div>
    );
}
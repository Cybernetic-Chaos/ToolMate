import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, PackageOpen, Pickaxe, Store } from "lucide-react"
import { useEffect, useState, useRef, useContext, SetStateAction, Dispatch, memo, useCallback } from "react"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { SlidersHorizontal } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { getBunningsFilterData, getImageUrl } from "@/lib/utils"
import { IBunningProduct, IBunningsFilter } from "@/types/types"
import { RightSidebarContext } from "@/context/rightSidebarContext"
import { Badge } from "../ui/badge"
import { Button, buttonVariants } from "../ui/button"
import { Link } from "react-router-dom"

/* Simple local cache to store category -> products data */
const bunningsCache: Record<string, any> = {}

type IActiveDash = "products" | "filter" | "details" | "filterProduct"

type IProduct = {
    categoryName: string
    products: any[]
}



type IVendorFilter = {
    price: [number, number]
    isOfferAvailable: boolean
}

type IMateyProductFilter = {
    price: [number, number]
}

interface IProductDialogProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    bunningsProduct: IProduct[];
    vendorProduct: IProduct[] | undefined;
    mateyMadeProduct: IProduct[];
}


const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle = false
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export default function ProductDialog({
    bunningsProduct,
    vendorProduct,
    mateyMadeProduct,
    isOpen,
    setIsOpen,
}: IProductDialogProps) {

    const [activeDash, setActiveDash] = useState<IActiveDash>("products")
    const [activeTab, setActiveTab] = useState<string>(
        (bunningsProduct?.length ?? 0) > 0
            ? "bunnings"
            : (vendorProduct?.length ?? 0) > 0
                ? "vendor"
                : (mateyMadeProduct?.length ?? 0) > 0
                    ? "matey-made"
                    : "bunnings"
    )
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        (bunningsProduct && bunningsProduct.length > 0)
            ? bunningsProduct[0].categoryName
            : (vendorProduct && vendorProduct.length > 0)
                ? vendorProduct[0].categoryName
                : (mateyMadeProduct && mateyMadeProduct.length > 0)
                    ? mateyMadeProduct[0].categoryName
                    : null
    )
    const [isBunningsDataLoading, setIsBunningsDataLoading] =
        useState<boolean>(false)
    const [isBunningsDataError, setIsBunningsDataError] = useState<boolean>(false)
    const [BunningsDataError, setBunningsDataError] = useState<string>("")
    const [bunningsData, setBunningsData] = useState<any>(null)
    const [mateyMadeData, setMateyMadeData] = useState<any>(null)
    const [allBunningsData, setAllBunningsData] = useState<any>(null)
    const [vendorProductData, setVendorProductData] = useState<any>(null)
    const [isImageLoading, setImageLoading] = useState<boolean>(true)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [bunningsFilter, setBunningsFilter] = useState<IBunningsFilter>({
        price: [0, 0],
        brands: [],
        isTopBrand: false,
        newArrival: false,
        bestSeller: false,
    })
    const [currentFilter, setCurrentFilter] = useState<IBunningsFilter | null>(null)
    const {
        setItemNumberToBunnings,
        getItemFromBunningsCache
    } = useContext(RightSidebarContext)
    /* Throttled function */
    const throttledGetBunningsData = throttle(getBunningsData, 2000)
    const hasFullProductData = (products: any[]): boolean => {
        return products && products.length > 0 && typeof products[0] === 'object'
    }
    const { data: cachedData } = useQuery({
        queryKey: ["bunningsData", selectedCategory],
        queryFn: getBunningsData,
        enabled: !!selectedCategory,
        staleTime: 5 * 60 * 1000,
    })
    useEffect(() => {
        console.log(bunningsProduct, selectedCategory, bunningsData, "is here bunningsProduct", selectedCategory, "")
    }, [bunningsProduct, selectedCategory])

    // if full product then set whole state
    useEffect(() => {
        if (hasFullProductData(bunningsProduct)) {
            setAllBunningsData(bunningsProduct)
        }
    }, [bunningsProduct])

    // check if the component is mounted in mobile if so then set isMobile field
    useEffect(() => {
        if (window.innerWidth < 768) {
            console.log("is mobile")
            setIsMobile(true)
        }
    }, [])

    useEffect(() => {
        if (activeDash == "products") {
            setSelectedProduct(null)
        }
    }, [activeDash])


    // get filter data
    useEffect(() => {
        console.log("chekcing bunningsData", bunningsData)
        if (bunningsData) {
            const filterData = getBunningsFilterData(bunningsData, bunningsFilter)
            console.log(filterData, "is here filter ");
            setBunningsFilter({
                ...filterData,
                price: filterData.price as [number, number]
            })
        }
    }, [bunningsData])

    // data will come from component filter
    function onBunningsFilter(filterData: IBunningsFilter) {
        console.log(filterData, "sdfsdcds");
        if (!filterData) return
        setCurrentFilter(filterData)
        setActiveDash("filterProduct")
    }

    // Modified getBunningsData function
    async function getBunningsData() {
        if (!bunningsProduct || !selectedCategory) return;

        const itemMap = bunningsProduct.find(
            (product) => product.categoryName === selectedCategory
        );
        if (!itemMap) return;

        // If we already have full product data, return it directly
        if (hasFullProductData(itemMap.products)) {
            const products = itemMap.products;
            setBunningsData(products);
            setAllBunningsData((prev: any) => {
                const combinedData = [...(prev || []), ...products];
                const uniqueData = combinedData.filter((item, index, self) =>
                    index === self.findIndex((t) => t.itemNumber === item.itemNumber)
                );
                return uniqueData;
            });
            setBunningsFilter(getBunningsFilterData(products, bunningsFilter));
            return products;
        }

        // Otherwise, proceed with cache/API logic for itemNumbers
        const cacheKey = `bunnings-${selectedCategory}`;
        if (bunningsCache[cacheKey]) {
            setBunningsData(bunningsCache[cacheKey]);
            setBunningsFilter(getBunningsFilterData(bunningsCache[cacheKey], bunningsFilter));
            return bunningsCache[cacheKey];
        }

        setIsBunningsDataLoading(true);
        try {
            let cachedProducts = [];
            let uncachedItemNumbers = [];

            // Check cache for each itemNumber
            for (const itemNumber of itemMap.products) {
                const cachedProduct = getItemFromBunningsCache(itemNumber);
                if (cachedProduct) {
                    cachedProducts.push(cachedProduct);
                } else {
                    uncachedItemNumbers.push(itemNumber);
                }
            }

            // If all products are cached, use them directly
            if (uncachedItemNumbers.length === 0) {
                setBunningsData(cachedProducts);
                setBunningsFilter(getBunningsFilterData(cachedProducts, bunningsFilter));
                return cachedProducts;
            }

            // Fetch uncached products from API
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/getBunningsProductFromItemMap`,
                { itemMap: [{ categoryName: selectedCategory, products: uncachedItemNumbers }] }
            );

            if (response.data.data) {
                const apiProducts = response.data.data[0].products;
                const allProducts = [...cachedProducts, ...apiProducts];

                bunningsCache[cacheKey] = allProducts;
                setBunningsData(allProducts);
                setBunningsFilter(getBunningsFilterData(allProducts, bunningsFilter));

                setAllBunningsData((prev: any) => prev ? [...prev, ...allProducts] : allProducts);

                // Update individual item cache
                apiProducts.forEach((product: any) => {
                    setItemNumberToBunnings(product.itemNumber, product);
                });

                return allProducts;
            }
        } catch (error: any) {
            setIsBunningsDataError(true);
            setBunningsDataError(error.message);
        } finally {
            setIsBunningsDataLoading(false);
        }
    }



    useEffect(() => {
        if (cachedData) {
            setBunningsData(cachedData)
        }
    }, [cachedData])

    // Modified useEffect
    useEffect(() => {
        if (
            bunningsProduct &&
            activeTab === "bunnings" &&
            activeDash === "products" &&
            selectedCategory &&
            selectedCategory.length > 0
        ) {
            const categoryProducts = bunningsProduct.find(
                (item) => item.categoryName === selectedCategory
            )?.products;

            if (!categoryProducts) return;

            if (hasFullProductData(categoryProducts)) {
                // If we have full product data, set it directly
                setBunningsData(categoryProducts);
                setBunningsFilter(getBunningsFilterData(categoryProducts, bunningsFilter));
            } else {
                // If we have item numbers, fetch the data
                throttledGetBunningsData();
            }
        }
    }, [bunningsProduct, activeTab, activeDash, selectedCategory]);


    useEffect(() => {
        if (mateyMadeProduct && activeTab === "matey-made" && selectedCategory && selectedCategory.length > 0) {
            setMateyMadeData(mateyMadeProduct.find((item) => item.categoryName == selectedCategory)?.products)
            console.log("mateyMadeData:", mateyMadeProduct.find((item) => item.categoryName == selectedCategory)?.products)
        }

    }, [mateyMadeProduct, selectedCategory])

    useEffect(() => {
        if (vendorProduct && activeTab === "vendor" && selectedCategory && selectedCategory.length > 0) {
            setVendorProductData(vendorProduct.find((item) => item.categoryName == selectedCategory)?.products)
            console.log("vendorProductData:", vendorProduct.find((item) => item.categoryName == selectedCategory)?.products)
        }

    }, [vendorProduct, selectedCategory])

    useEffect(() => {
        console.log("bunningsProduct:", bunningsProduct)
        console.log("vendorProduct:", vendorProduct)
        console.log("mateyMadeProduct:", mateyMadeProduct)

        console.log("isOpen:", isOpen)
    }, [
        bunningsProduct,
        vendorProduct,
        mateyMadeProduct,
        isOpen,
    ])



    const onCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category)
    }, [])
    // activate products card
    useEffect(() => {
        if (selectedProduct) {
            setActiveDash("details")
        }
    }, [selectedProduct])


    // this is core compoent or content this is seperate because it is used in both drawe and dialog 
    console.log("bunningsData:", bunningsData, "mateyMadeData:", mateyMadeData, "vendorProductData:", vendorProductData, "0900000000")


    console.log("bunningsData:", bunningsData, "mateyMadeData:", mateyMadeData, "vendorProduct:", vendorProduct, "0900000000")
    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="h-[calc(100%-10rem)] lg:max-w-screen-xl max-w-screen-lg md:max-w-screen-md sm:max-w-screen-sm p-0  ">
                    <div className="w-full h-full p-4 overflow-y-scroll">
                        {/* heading */}
                        <div className="flex w-full">
                            <Tabs
                                defaultValue="bunnings"
                                className="w-full h-full"
                                value={activeTab}
                                onValueChange={(value) => {
                                    setActiveTab(value)
                                    console.log("value:", value)
                                }}
                            >
                                <div className="flex flex-col sm:flex-row gap-2 items-center w-full h-full">
                                    <TabsList className="bg-white mx-2 text-black rounded-md flex gap-1 w-full sm:w-auto">
                                        <TabsTrigger
                                            value="bunnings"
                                            className="data-[state=active]:bg-yellow bg-slate-200 flex items-center space-x-2 hover:bg-slate-200 w-full sm:w-auto justify-center"
                                        >
                                            <Store className="w-5 h-5 mr-2" />
                                            {
                                                isMobile ? "Bunnings" : <span>Bunnings Products</span>
                                            }
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="vendor"
                                            className="data-[state=active]:bg-yellow bg-slate-200 flex items-center space-x-2 hover:bg-slate-200 w-full sm:w-auto justify-center"
                                        >
                                            <Pickaxe className="w-5 h-5 mr-2" />
                                            {
                                                isMobile ? "Vendors" : <span>Vendor Store</span>
                                            }
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="matey-made"
                                            className="data-[state=active]:bg-yellow bg-slate-200 flex items-center space-x-2 hover:bg-slate-200 w-full sm:w-auto justify-center"
                                        >
                                            <PackageOpen className="w-5 h-5 mr-2" />
                                            {
                                                isMobile ? "Matey Made" : <span>Matey Made Products</span>
                                            }
                                        </TabsTrigger>
                                    </TabsList>
                                    <div
                                        onClick={() => {
                                            setActiveDash((prev) => prev === "filter" ? "products" : "filter")
                                        }}
                                        className="bg-slate-200 px-6 py-2 cursor-pointer rounded-md shadow-md flex gap-2 items-center font-semibold text-black hover:bg-slate-300 w-full sm:w-auto justify-center"
                                    >
                                        <SlidersHorizontal className="w-5 h-5 m-1" />
                                        <p>Filter</p>
                                    </div>
                                </div>
                                {activeDash === "filter" ? (
                                    <Filter
                                        onFilterApply={onBunningsFilter}
                                        activeDash={activeDash}
                                        setActivedash={setActiveDash}
                                        filterFields={
                                            bunningsFilter ? Object.keys(bunningsFilter) : []
                                        }
                                        bestSeller={bunningsFilter?.bestSeller}
                                        newArrival={bunningsFilter?.newArrival}
                                        brands={bunningsFilter?.brands}
                                        pricing={bunningsFilter?.price}
                                        isTopBrand={bunningsFilter?.isTopBrand}

                                    />
                                ) : activeDash === "products" ? (
                                    <div>
                                        <TabsContent
                                            value="bunnings"
                                            className="rounded-md flex-1 h-full min-h-full"
                                        >
                                            <div className="w-full p-2 h-full flex-1 flex rounded-md">
                                                <EmptyProductListFallBack
                                                    activeTab="bunnings"
                                                    data={bunningsProduct}
                                                    component={
                                                        <SpeadCategory
                                                            products={bunningsProduct?.map(
                                                                (product) => product.categoryName
                                                            )!}
                                                            onCategoryChange={onCategoryChange}
                                                            activeCategory={selectedCategory}
                                                        />
                                                    }
                                                />
                                            </div>
                                            {isBunningsDataLoading ? (
                                                <div className="w-full h-full flex-1 mt-20 flex flex-col gap-2 items-center justify-center">
                                                    <img
                                                        className="animate-pulse rounded-md"
                                                        src="/assets/images/bunnings-logo.png"
                                                        alt="loading"
                                                        width={65}
                                                        height={65}
                                                    />
                                                    <p className="font-semibold text-lg">
                                                        Loading Bunnings Products....
                                                    </p>
                                                </div>
                                            ) : isBunningsDataError ? (
                                                <div className="w-full h-full flex-1 mt-20 flex flex-col gap-2 items-center justify-center">
                                                    <p className="font-semibold text-lg text-red-500">
                                                        Error Fetching Bunnings Products
                                                    </p>
                                                    <p className="text-red-500">{BunningsDataError}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                                                    {bunningsData &&
                                                        bunningsData.map((product: any, index: number) => (
                                                            <div onClick={() => {
                                                                console.log("setting products", product)
                                                                setSelectedProduct(product)
                                                            }}>
                                                                <ProductCard key={index} product={product} />

                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="vendor">
                                            <SpeadCategory
                                                activeCategory={selectedCategory}
                                                products={vendorProduct?.map((product) => product.categoryName) || []}
                                                onCategoryChange={onCategoryChange}
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                                {vendorProductData && vendorProductData.length > 0 ? (
                                                    vendorProductData.map((product: any, index: number) => (
                                                        <Card key={index} className="w-full max-w-sm flex flex-col gap-1 items-start text-left">
                                                            <div className="relative h-48 w-full">
                                                                {product.imageParams.length === 1 ? (
                                                                    <div className="flex items-center justify-center">
                                                                        <img
                                                                            className="max-h-48"
                                                                            src={getImageUrl(product.imageParams[0])}
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <Carousel className="relative">
                                                                        <CarouselContent>
                                                                            {product.imageParams.map((image: string, idx: number) => (
                                                                                <CarouselItem key={idx} className="flex items-center justify-center">
                                                                                    <img className="max-h-48" src={getImageUrl(image)} alt="" />
                                                                                </CarouselItem>
                                                                            ))}
                                                                        </CarouselContent>
                                                                        <CarouselPrevious className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-slate-300 p-2 rounded-full shadow-md cursor-pointer" />
                                                                        <CarouselNext className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-slate-300 p-2 rounded-full shadow-md cursor-pointer" />
                                                                    </Carousel>
                                                                )}
                                                            </div>
                                                            <CardHeader>
                                                                <CardTitle>{product.name}</CardTitle>
                                                                <CardDescription className="line-clamp-2">
                                                                    {product.description}
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {product.offerDescription && (
                                                                    <Badge variant="secondary" className="mb-2">
                                                                        {product.offerDescription}
                                                                    </Badge>
                                                                )}
                                                                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                                                            </CardContent>
                                                            <CardFooter className="w-full flex flex-col gap-2">
                                                                <Button
                                                                    variant={"orangeGradient"}
                                                                    className="w-full"
                                                                    onClick={() => window.open(product.url, "_blank")}
                                                                >
                                                                    Visit Site
                                                                </Button>
                                                                <Button
                                                                    className="bg-slate-200 w-full hover:bg-white rounded-md text-black border-2 hover:border-slate-500 "
                                                                    onClick={() => {
                                                                        setSelectedProduct(product)
                                                                    }}
                                                                >
                                                                    More Details
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <p>No products available</p>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="matey-made"
                                        >

                                            <SpeadCategory activeCategory={selectedCategory} products={mateyMadeProduct?.map((product) => product.categoryName)!} onCategoryChange={onCategoryChange} />

                                            <EmptyProductListFallBack
                                                activeTab="matey-made"
                                                data={mateyMadeData}
                                                component={
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 p-4">
                                                        {
                                                            mateyMadeData && mateyMadeData.length > 0 && mateyMadeData.map((product: any, index: number) => (
                                                                <Card key={index} className="w-full flex gap-2 flex-col px-4 py-2 pb-4 max-w-md bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                                                    <div className="flex justify-between items-start">
                                                                        <CardTitle className="text-2xl font-bold text-slate-800 text-left">{product.name}</CardTitle>
                                                                    </div>
                                                                    <div className="col-span-2 mt-4">
                                                                        <h3 className="font-semibold text-slate-700 mb-2">Description:</h3>
                                                                        <p className="text-slate-600 text-sm text-left">An AI-equipped saw for precise cuts and measurements</p>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <h3 className="font-semibold text-slate-700 mb-2">Personal Usage:</h3>
                                                                        <p className="text-slate-600 text-sm text-left">Use this saw for accurate and efficient cutting in your woodworking projects</p>
                                                                    </div>
                                                                    <span className="text-2xl font-bold text-slate-800 text-left">${product.price}</span>
                                                                </Card>
                                                            ))
                                                        }
                                                    </div>

                                                }
                                            />

                                        </TabsContent>

                                    </div>
                                ) : activeDash === "details" ? (
                                    <div>
                                        <Product
                                            activeDash={activeDash}
                                            setActiveDash={setActiveDash}
                                            productData={selectedProduct}
                                            activeTab={activeTab && activeTab == "bunnings" ? "bunnings" : activeTab == "vendor" ? "vendor" : "bunnings"}
                                        />
                                    </div>
                                ) : activeDash == "filterProduct" && (
                                    <div>
                                        <ShowFilteredBunningsProduct
                                            setSelectedProducts={setSelectedProduct}
                                            setActiveDash={setActiveDash}
                                            filterList={currentFilter!}
                                            bunningsProduct={allBunningsData.filter((product: any) => {
                                                console.log(product, "is here product4545")
                                                if (!product?.categoryName) {
                                                    return true
                                                }
                                                return false
                                            })}
                                        />
                                    </div>
                                )}
                            </Tabs>
                        </div>
                    </div>
                </DrawerContent >
            </Drawer>

        )
    }



    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="h-[calc(100%-10rem)] lg:max-w-screen-xl max-w-screen-lg md:max-w-screen-md sm:max-w-screen-sm p-0 overflow-y-scroll hide-scrollbar">
                <div className="w-full h-full p-4">
                    {/* heading */}
                    <div className="flex w-full">
                        <Tabs
                            defaultValue="bunnings"
                            className="w-full h-full"
                            value={activeTab}
                            onValueChange={(value) => {
                                setActiveTab(value)
                                if (value == "bunnings") {
                                    setSelectedCategory(bunningsProduct[0]?.categoryName || "")
                                }
                                else if (value == "vendor") {
                                    setSelectedCategory(vendorProduct && vendorProduct[0]?.categoryName ? vendorProduct[0]?.categoryName : "")
                                }
                                else if (value == "matey-made") {
                                    setSelectedCategory(mateyMadeProduct[0]?.categoryName || "")
                                }
                                console.log("value:", value)
                            }}
                        >
                            <div className="flex gap-2 items-center w-full h-full">
                                <TabsList className="bg-slate-300 text-black rounded-md  flex gap-1">
                                    <TabsTrigger
                                        value="bunnings"
                                        className="data-[state=active]:bg-yellow flex items-center space-x-2 hover:bg-slate-200"
                                    >
                                        <Store className="w-5 h-5" />
                                        <span>Bunnings Products</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="vendor"
                                        className="data-[state=active]:bg-yellow flex items-center space-x-2 hover:bg-slate-200"
                                    >
                                        <Pickaxe className="w-5 h-5" />
                                        <span>Vendor Store</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="matey-made"
                                        className="data-[state=active]:bg-yellow flex items-center space-x-2 hover:bg-slate-200"
                                    >
                                        <PackageOpen className="w-5 h-5" />
                                        <span>Matey Made Products</span>
                                    </TabsTrigger>
                                </TabsList>
                                <div
                                    onClick={() => {
                                        setActiveDash((prev) => prev === "filter" ? "products" : "filter")
                                    }}
                                    className="bg-slate-200 px-6 py-2 cursor-pointer rounded-md shadow-md flex gap-2 items-center font-semibold text-black hover:bg-slate-300">
                                    <SlidersHorizontal className="w-5 h-5 m-1" />
                                    <p>Filter</p>
                                </div>
                            </div>
                            {activeDash === "filter" ? (
                                <Filter
                                    onFilterApply={onBunningsFilter}
                                    activeDash={activeDash}
                                    setActivedash={setActiveDash}
                                    filterFields={
                                        bunningsFilter ? Object.keys(bunningsFilter) : []
                                    }
                                    bestSeller={bunningsFilter?.bestSeller}
                                    newArrival={bunningsFilter?.newArrival}
                                    brands={bunningsFilter?.brands}
                                    pricing={bunningsFilter?.price}
                                    isTopBrand={bunningsFilter?.isTopBrand}

                                />
                            ) : activeDash === "products" ? (
                                <div>
                                    <TabsContent
                                        value="bunnings"
                                        className="rounded-md flex-1 h-full min-h-full"
                                    >
                                        <div className="w-full p-2 h-full flex-1 flex rounded-md">
                                            <EmptyProductListFallBack
                                                activeTab="bunnings"
                                                data={bunningsProduct}
                                                component={
                                                    <SpeadCategory
                                                        products={bunningsProduct?.map(
                                                            (product) => product.categoryName
                                                        )!}
                                                        onCategoryChange={onCategoryChange}
                                                        activeCategory={selectedCategory}
                                                    />
                                                }
                                            />
                                        </div>
                                        {isBunningsDataLoading ? (
                                            <div className="w-full h-full flex-1 mt-20 flex flex-col gap-2 items-center justify-center">
                                                <img
                                                    className="animate-pulse rounded-md"
                                                    src="/assets/images/bunnings-logo.png"
                                                    alt="loading"
                                                    width={65}
                                                    height={65}
                                                />
                                                <p className="font-semibold text-lg">
                                                    Loading Bunnings Products....
                                                </p>
                                            </div>
                                        ) : isBunningsDataError ? (
                                            <div className="w-full h-full flex-1 mt-20 flex flex-col gap-2 items-center justify-center">
                                                <p className="font-semibold text-lg text-red-500">
                                                    Error Fetching Bunnings Products
                                                </p>
                                                <p className="text-red-500">{BunningsDataError}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                                                {bunningsData &&
                                                    bunningsData.map((product: any, index: number) => (
                                                        <div onClick={() => {
                                                            console.log("setting products", product)
                                                            setSelectedProduct(product)
                                                        }}>
                                                            <ProductCard key={index} product={product} />

                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="vendor">
                                        <SpeadCategory
                                            activeCategory={selectedCategory}
                                            products={vendorProduct?.map((product) => product.categoryName) || []}
                                            onCategoryChange={onCategoryChange}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                            {vendorProductData && vendorProductData.length > 0 ? (
                                                vendorProductData.map((product: any, index: number) => (
                                                    <Card key={index} className="w-full max-w-sm overflow-hidden flex flex-col gap-1 items-start text-left">
                                                        <div className="relative h-48 w-full">
                                                            {product.imageParams.length === 1 ? (
                                                                <div className="flex items-center justify-center">
                                                                    <img
                                                                        className="max-h-48"
                                                                        src={getImageUrl(product.imageParams[0])}
                                                                        alt=""
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Carousel className="relative">
                                                                    <CarouselContent>
                                                                        {product.imageParams.map((image: string, idx: number) => (
                                                                            <CarouselItem key={idx} className="flex items-center justify-center">
                                                                                <img className="max-h-48" src={getImageUrl(image)} alt="" />
                                                                            </CarouselItem>
                                                                        ))}
                                                                    </CarouselContent>
                                                                    <CarouselPrevious className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-slate-300 p-2 rounded-full shadow-md cursor-pointer" />
                                                                    <CarouselNext className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-slate-300 p-2 rounded-full shadow-md cursor-pointer" />
                                                                </Carousel>
                                                            )}
                                                        </div>
                                                        <CardHeader>
                                                            <CardTitle>{product.name}</CardTitle>
                                                            <CardDescription className="line-clamp-2">
                                                                {product.description}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {product.offerDescription && (
                                                                <Badge variant="secondary" className="mb-2">
                                                                    {product.offerDescription}
                                                                </Badge>
                                                            )}
                                                            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                                                        </CardContent>
                                                        <CardFooter className="w-full flex flex-col gap-2">
                                                            <Button
                                                                variant={"orangeGradient"}
                                                                className="w-full"
                                                                onClick={() => window.open(product.url, "_blank")}
                                                            >
                                                                Visit Site
                                                            </Button>
                                                            <Button
                                                                className="bg-slate-200 w-full hover:bg-white rounded-md text-black border-2 hover:border-slate-500 "
                                                                onClick={() => {
                                                                    setSelectedProduct(product)
                                                                }}
                                                            >
                                                                More Details
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                ))
                                            ) : (
                                                <p>No products available</p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="matey-made"
                                    >

                                        <SpeadCategory activeCategory={selectedCategory} products={mateyMadeProduct?.map((product) => product.categoryName)!} onCategoryChange={onCategoryChange} />

                                        <EmptyProductListFallBack
                                            activeTab="matey-made"
                                            data={mateyMadeData}
                                            component={
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 p-4">
                                                    {
                                                        mateyMadeData && mateyMadeData.length > 0 && mateyMadeData.map((product: any, index: number) => (
                                                            <Card key={index} className="w-full flex gap-2 flex-col px-4 py-2 pb-4 max-w-md bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                                                <div className="flex justify-between items-start">
                                                                    <CardTitle className="text-2xl font-bold text-slate-800 text-left">{product.name}</CardTitle>
                                                                </div>
                                                                <div className="col-span-2 mt-4">
                                                                    <h3 className="font-semibold text-slate-700 mb-2">Description:</h3>
                                                                    <p className="text-slate-600 text-sm text-left">An AI-equipped saw for precise cuts and measurements</p>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <h3 className="font-semibold text-slate-700 mb-2">Personal Usage:</h3>
                                                                    <p className="text-slate-600 text-sm text-left">Use this saw for accurate and efficient cutting in your woodworking projects</p>
                                                                </div>
                                                                <span className="text-2xl font-bold text-slate-800 text-left">${product.price}</span>
                                                            </Card>
                                                        ))
                                                    }
                                                </div>

                                            }
                                        />

                                    </TabsContent>

                                </div>
                            ) : activeDash === "details" ? (
                                <div>
                                    <Product
                                        activeDash={activeDash}
                                        setActiveDash={setActiveDash}
                                        productData={selectedProduct}
                                        activeTab={activeTab && activeTab == "bunnings" ? "bunnings" : activeTab == "vendor" ? "vendor" : "bunnings"}
                                    />
                                </div>
                            ) : activeDash == "filterProduct" && (
                                <div>
                                    <ShowFilteredBunningsProduct
                                        setSelectedProducts={setSelectedProduct}
                                        setActiveDash={setActiveDash}
                                        filterList={currentFilter!}
                                        bunningsProduct={allBunningsData.filter((product: any) => {
                                            console.log(product, "is here product4545")
                                            if (!product?.categoryName) {
                                                return true
                                            }
                                            return false
                                        })}
                                    />
                                </div>
                            )}
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


const SpeadCategory = memo(function SpeadCategory({
    products,
    onCategoryChange,
    activeCategory,
}: {
    products: string[];
    onCategoryChange: (category: string) => void;
    activeCategory: string | null;
}) {
    console.log(products, "is here products", activeCategory, "from", products, "66");

    return (
        <Carousel className="w-full flex items-center justify-center relative md:px-2 py-1 rounded-lg ">
            <CarouselPrevious className="absolute left-2 z-10 bg-slate-300 hover:bg-slate-400 rounded-full p-2" />
            <div className="mx-12 px-4 py-2 rounded-lg w-full z-0">
                <CarouselContent className="flex space-x-4">
                    {products && products.length > 0 && products.map((product, index) => (
                        <CarouselItem
                            onClick={() => onCategoryChange(product)}
                            key={index}
                            className={`${activeCategory === product ? "bg-lightYellow" : ""
                                } m-0 p-0  md:basis-1/3 lg:basis-1/5 py-1 rounded-md cursor-pointer`}
                        >
                            <p className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">
                                {product}
                            </p>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </div>
            <CarouselNext className="absolute right-4 bg-slate-300 z-10 hover:bg-slate-400 rounded-full p-2" />
        </Carousel>
    );
});



function EmptyProductListFallBack({
    activeTab,
    component,
    data,
}: {
    activeTab: string
    component: React.ReactNode
    data: any
}) {
    if (activeTab === "bunnings" && data && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-slate-500 font-semibold">No products found</p>
                    <p className="text-slate-500">
                        Keep Chating Matey Will Suggest Use full product Soon
                    </p>
                </div>
            </div>
        )
    }

    if (activeTab === "vendor" && data && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-slate-500 font-semibold">No products found</p>
                    <p className="text-slate-500">
                        Keep Chating Matey Will Suggest Use full product Soon
                    </p>
                </div>
            </div>
        )
    }

    if (activeTab === "matey-made" && data && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-slate-500 font-semibold">No products found</p>
                    <p className="text-slate-500">
                        Keep Chating Matey Will Suggest Use full product Soon
                    </p>
                </div>
            </div>
        )
    }

    return <div className="w-full">{component}</div>
}



function Filter({
    onFilterApply,
    activeDash,
    setActivedash,
    filterFields = ["pricing"],
    pricing = [5, 150],
    brands,
    isTopBrand,
    newArrival,
    bestSeller,
}: {
    onFilterApply: (filterData: IBunningsFilter) => void
    activeDash: string
    setActivedash: (dash: IActiveDash) => void,
    filterFields?: string[],
    pricing?: [number, number],
    brands?: string[],
    isTopBrand?: boolean,
    newArrival?: boolean,
    bestSeller?: boolean
}) {
    const [currPrice, setCurrPrice] = useState(pricing[0])
    const [selectedBrands, setSelectedBrands] = useState<string[]>(brands ? brands : [])
    const [isTopBrandChecked, setIsTopBrandChecked] = useState<boolean>(false)
    const [isNewArrivalChecked, setIsNewArrivalChecked] = useState<boolean>(false)
    const [isBestSellerChecked, setIsBestSellerChecked] = useState<boolean>(false)

    const handleApplyFilter = () => {
        const filterData: IBunningsFilter = {
            price: [pricing[0], currPrice],
            brands: selectedBrands,
            isTopBrand: isTopBrandChecked,
            newArrival: isNewArrivalChecked,
            bestSeller: isBestSellerChecked,
        }
        console.log(filterData, "is here filter data")
        onFilterApply(filterData)
    }


    useEffect(() => {
        setSelectedBrands(brands ? brands : [])
        setCurrPrice(pricing[1])
    }, [brands])

    return (
        <div className="flex flex-col items-start gap-4 w-full my-4">
            <div
                onClick={() => setActivedash("products")}
                className="flex hover:bg-slate-200 items-center rounded-md gap-2 w-fit bg-slate-300  px-5 py-2 font-semibold">
                <ArrowLeft />
                Back
            </div>
            {filterFields.includes("brands") && (
                <div className="block md:flex items-center gap-1">
                    <p className="font-semibold text-lg px-4 py-2 bg-slate-200 rounded-md">Brands</p>
                    <div className="flex flex-col gap-2">
                        <ToggleGroup
                            type="multiple"
                            value={selectedBrands}
                            onValueChange={(value) => setSelectedBrands(value)}
                            variant={"outline"}
                            className="grid md:flex  grid-cols-3"
                        >
                            {
                                brands?.map((brand) => (
                                    <ToggleGroupItem
                                        className="text-ellipsis data-[state=on]:border-black data-[state=on]:bg-yellow"
                                        key={brand}
                                        value={brand}
                                    >
                                        {brand}
                                    </ToggleGroupItem>
                                ))
                            }
                        </ToggleGroup>
                    </div>
                </div>
            )}

            {filterFields.includes("price") && (
                <div className="flex w-full flex-col md:w-1/2 md:flex-row gap-2 items-center">
                    <p className="font-semibold text-lg w-full px-4 py-2 bg-slate-200 rounded-md md:w-1/3">Price</p>
                    <div className="flex flex-col gap-2 items-center w-full">
                        <Slider
                            onValueChange={(value) => {
                                setCurrPrice(value[0])
                            }}
                            value={[currPrice]}
                            min={pricing[0]}
                            defaultValue={[33]} max={pricing[1]} step={1} />
                        <div className="flex justify-between w-full">
                            <span>${pricing[0]}</span>
                            <span>${currPrice}</span>
                            <span>${pricing[1]}</span>
                        </div>
                    </div>
                </div>
            )}
            {filterFields.includes("isTopBrand") && (
                <div className="flex gap-2 ">
                    <p className="font-semibold text-lg px-4 py-2 bg-slate-200 rounded-md w-fit">Top Brands Only</p>
                    <label>
                        <Checkbox className="w-8 h-8" checked={isTopBrandChecked} onCheckedChange={(checked) => setIsTopBrandChecked(checked === true)} />
                    </label>
                </div>
            )}
            {filterFields.includes("newArrival") && (
                <div className="flex items-center gap-2 ">
                    <p className="font-semibold text-lg px-4 py-2 bg-slate-200 rounded-md w-fit">New Arrival Only</p>
                    <label>
                        <Checkbox className="w-8 h-8" checked={isNewArrivalChecked} onCheckedChange={(checked) => setIsNewArrivalChecked(checked == true)} />
                    </label>
                </div>
            )}
            {filterFields.includes("bestSeller") && (
                <div className="flex items-center gap-2 ">
                    <p className="font-semibold text-lg px-4 py-2 bg-slate-200 rounded-md w-fit">Best Seller Only</p>
                    <label>
                        <Checkbox className="w-8 h-8" checked={isBestSellerChecked} onCheckedChange={(checked) => setIsBestSellerChecked(checked == true)} />
                    </label>
                </div>
            )}

            <div className="flex gap-2 p-2 bg-slate-200 rounded-md ">
                <button
                    onClick={handleApplyFilter}
                    className="bg-yellow px-10 hover:bg-lightYellow text-black font-semibold py-2 rounded-md">
                    Apply Filter
                </button>
                <button
                    onClick={() => {
                        setCurrPrice(pricing[0])
                        setSelectedBrands([])
                        setIsTopBrandChecked(false)
                        setIsNewArrivalChecked(false)
                        setIsBestSellerChecked(false)
                    }}
                    className="bg-slate-400 px-10 hover:bg-slate-300 text-black font-semibold py-2 rounded-md">
                    Clear Filter
                </button>
            </div>
        </div>

    );
}


function ShowFilteredBunningsProduct({
    setSelectedProducts,
    setActiveDash,
    filterList,
    bunningsProduct
}: {
    setSelectedProducts: (product: any) => void,
    setActiveDash: (dash: IActiveDash) => void,
    filterList: IBunningsFilter,
    bunningsProduct: IBunningProduct[]
}) {

    console.log(filterList, "is here filterList", bunningsProduct, "is here bunningsProduct")
    if (!bunningsProduct || !filterList) return <div>Can't show products Right not</div>;

    const [filteredProducts, setFilteredProducts] = useState<IBunningProduct[]>(bunningsProduct);

    useEffect(() => {
        const filtered = bunningsProduct.filter((product) => {
            let isFiltered = true;
            if (filterList.brands && filterList.brands.length > 0) {
                console.log(filterList.brands, "is here filterList")
                isFiltered = filterList.brands.map((brand) => product.brand.includes(brand)).includes(true);
            }
            if (filterList.price) {
                isFiltered = isFiltered && product.price.unitPrice <= filterList.price[1]
            }
            if (filterList.isTopBrand) {
                isFiltered = isFiltered && product.bestSeller
            }
            if (filterList.newArrival) {
                isFiltered = isFiltered && product.newArrival
            }
            if (filterList.bestSeller) {
                isFiltered = isFiltered && product.leadingBrand
            }
            return isFiltered;
        })
        console.log(filtered, "is here filteredfff")
        setFilteredProducts(filtered);
    }, [])

    return (
        <div className="p-4 flex-col flex gap-2">

            <div
                onClick={() => setActiveDash("filter")}
                className="flex hover:bg-slate-200 items-center rounded-md gap-2 w-fit bg-slate-300  px-5 py-2 font-semibold">
                <ArrowLeft />
                Back
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
                {filteredProducts.map((product: any, index: number) => (
                    <div onClick={() => {
                        setSelectedProducts(product)
                    }}>
                        <ProductCard key={index} product={product} />
                    </div>
                ))}
            </div>
        </div>
    )


}

function ProductCard({ product }: { product: any }) {
    const [isImageLoading, setImageLoading] = useState<boolean>(true);
    console.log(product, "is here product----")
    return (
        <Card
            className="transition-transform transform hover:scale-105 shadow-lg rounded-lg overflow-hidden"
        >
            <CardHeader className="p-0">
                <div className="relative w-full h-40">
                    <img
                        src={product.heroImage}
                        alt={product.title}
                        className="w-full h-40 object-cover"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                    />
                    {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <span className="loader"></span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col h-full justify-between">
                    <p className="font-semibold text-lg text-slate-800 text-left">
                        {product.title}
                    </p>
                    <p className="text-slate-600 mt-2 text-left">
                        {product.price?.unitPrice === product.price?.lineUnitPrice
                            ? `$${product.price?.unitPrice}`
                            : `$${product.price?.unitPrice} - $${product.price?.lineUnitPrice} `}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function Product({
    activeDash,
    setActiveDash,
    activeTab,
    productData
}: {

    activeDash: string,
    setActiveDash: (dash: IActiveDash) => void,
    activeTab: string,
    productData: any
}) {
    // bunnings states
    const [isImageCoursel, setIsImageCoursel] = useState<boolean>(false)
    const [imageArray, setImageArray] = useState<string[]>([])
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    // initial data setter
    useEffect(() => {
        console.log("called", productData)
        if (activeTab == "bunnings") {
            const isOtherImages = productData.otherImages.length > 0
            if (isOtherImages) {
                setIsImageCoursel(true)
                setImageArray([productData.heroImage, ...productData.otherImages])
            }
        }
    }, [productData])




    if (!productData) {
        return <div>Product data not available</div>
    }
    // {
    //     "itemNumber": "0539755",
    //     "title": "RYOBI 18V ONE+ 8-Piece Kit R18X8C142B",
    //     "description": "The RYOBI 18V ONE+ 8-Piece Kit has all the essential cordless power tools for DIY projects, household maintenance and repairs in one convenient, value-packed bundle. It’s also a great gift idea for anyone getting started with ONE+ tools. This Kit includes an 18V ONE+ Drill Driver, 18V ONE+ Impact Driver, 18V ONE+ 150mm Circular Saw, 18V ONE+115mm Angle Grinder, 18V ONE+Reciprocating Saw, 18V ONE+ Toolshop Blower, 18V ONE+ Palm Sander, 18V ONE+ Multi Tool, 2 x 18V ONE+ 4.0Ah Batteries, 18V ONE+ Fast Charger.Drill holes and drive screws into various materials including timber and soft metal with the 18V ONE+ Drill Driver. Its two speed gearbox and 24 torque settings give you precise control for working on different materials. The in-built LED light illuminates confined and dark work areas. Use the 18V ONE+ Impact Driver to drive large/long screws and bolts into timber, metal and masonry. It generates high levels of torque (twisting power) and an impact action for hard materials. Its keyless auto-locking hex chuck enables fast bit changeovers.The 18V ONE+ 150mm Circular Saw makes clean cross cuts in timber varieties including plywood, pine and hardwoods. Its left-hand blade design provides enhanced blade and cut line visibility. Take on various grinding and finishing tasks with the 18V ONE+ 115mm Angle Grinder. For added safety, the line lock out function prevents accidental startups when a battery is inserted. The auxiliary handle locks into three different positions for added control. The 18V ONE+ Reciprocating Saw makes fast and rough cuts into nail-embedded timber and PVC pipes for demolition work. It’s also suitable for pruning tree branches and roots. Create a smooth finish on benchtops, furniture and other detailed woodwork projects with the 18V ONE+ Palm Sander. Its compact size gets into corners and other tight spots.The versatile 18V ONE+ Multi Tool performs plunge cuts into various materials including timber, nail-embedded timber and plaster. It’s also a great tool for sanding and shaping. This Multi-tool features a sanding pad, wood blade and wood/metal blade.Clean up your workbench or garage after a DIY project with the 18V ONE+ Workshop Blower. Use it to move sawdust and other dry debris. It’s also suitable for moving leaves from driveways and decks.Get plenty of runtime for any ONE+ tool with the 4.0Ah Batteries. Each one has temperature control, overload and deep discharge protection to prolong battery life. On-board fuel gauges show how much charge remains for both batteries. Charge any Battery from the ONE+ range with the Fast Charger.",
    //     "brand": "Ryobi One+",
    //     "leadingBrand": true,
    //     "newArrival": false,
    //     "bestSeller": false,
    //     "heroImage": "https://media.prod.bunnings.com.au/api/public/content/b49644bbc5ea4dd1997c046e91b325cd?v=a1fbec5f",
    //     "keySellingPoints": [
    //         " Kit includes: 18V ONE+ Drill Driver, 18V ONE+ Impact Driver, 18V ONE+ 150mm Circular Saw, 18V ONE+115mm Angle Grinder, 18V ONE+Reciprocating Saw, 18V ONE+ Toolshop Blower, 18V ONE+ Palm Sander, 18V ONE+ Multi Tool, 2 x 18V ONE+ 4.0Ah Batteries, 18V ONE+ Fast Charger",
    //         "Two speed gearbox and 24 torque settings (Drill Driver)",
    //         "Auto-locking hex drive for quick bit changes (Impact Driver)",
    //         "Left-hand blade design for improved blade and cut line visibility (Circular Saw)",
    //         "Three-position auxiliary handle (Angle Grinder)"
    //     ],
    //     "microSellingPoints": [],
    //     "price": {
    //         "itemNumber": "0539755",
    //         "unitPrice": 699,
    //         "lineUnitPrice": 699
    //     },
    //     "url": "https://www.bunnings.com.au/ryobi-18v-one+-8-piece-kit-R18X8C142B_p0539755"
    // }
    if (activeTab == "bunnings") {
        return <div className="w-full h-full flex flex-col gap-2 py-2">
            <div
                onClick={() => {
                    setActiveDash("products")
                }}
                className="flex hover:bg-slate-200 items-center rounded-md gap-2 w-fit bg-slate-300  px-5 py-2 font-semibold">
                <ArrowLeft />
                Back
            </div>
            <div className="flex gap-4 md:flex-row flex-col   w-full h-full">

                <div className="md:w-1/2 h-[80%] border-2 border-slate-300 outline-border rounded-lg overflow-hidden">
                    {
                        isImageCoursel ? (
                            <Carousel>
                                <CarouselContent>
                                    {
                                        imageArray.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <img src={image} alt="" />
                                            </CarouselItem>
                                        ))
                                    }
                                </CarouselContent>
                                <CarouselPrevious className="bg-slate-400 top-1/2 absolute left-2" />
                                <CarouselNext className="bg-slate-400 top-1/2 absolute right-2" />
                            </Carousel>

                        ) : (
                            <img src={productData.heroImage} alt="" />
                        )
                    }
                </div>

                <div className="md:w-1/2 h-[80%] flex flex-col gap-2 text-left">
                    <div className="flex flex-col gap-4"></div>
                    <h1 className="text-3xl font-bold text-slate-800">{productData.title}</h1>
                    <div>
                        {
                            isExpanded ? (
                                <p className={`text-slate-600 ${isExpanded ? "" : "line-clamp-3 "}`}>{productData.description}</p>
                            ) : (
                                <p className="text-slate-600 line-clamp-3">{productData.description}</p>
                            )
                        }
                        <button
                            className="text-blue-500 hover:underline mt-2"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? "Read Less" : "Read More"}
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold text-slate-700">Features</h2>
                        <ul className="list-disc list-inside text-slate-600">
                            {productData.keySellingPoints.map((point: string, index: number) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold text-slate-700">Price:</h2>
                        {
                            productData.price?.unitPrice === productData.price?.lineUnitPrice ? (
                                <p className="text-2xl font-bold text-slate-800">${productData.price?.unitPrice?.toFixed(2) || "No Data"}</p>
                            ) : (
                                <p className="text-2xl font-bold text-slate-800">${productData.price?.unitPrice?.toFixed(2)} - ${productData.price.lineUnitPrice.toFixed(2) || "No Data"}</p>
                            )
                        }
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant={"orangeGradient"}
                            className="w-full"
                            onClick={() => window.open(productData.url, "_blank")}
                        >
                            Visit Site
                        </Button>
                        <Button
                            className="bg-slate-200 w-full hover:bg-white rounded-md text-black border-2 hover:border-slate-500"
                            onClick={() => setActiveDash("products")}
                        >
                            Back to Products
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    }

    else if (activeTab == "vendor") {
        console.log("vendor data", productData)

        return <div className="w-full h-full overscroll-auto hide-scrollbar py-4">
            <div className="w-full h-full flex md:flex-row flex-col gap-2 py-2">
                <div
                    onClick={() => {
                        setActiveDash("products")
                    }}
                    className="flex hover:bg-slate-200 items-center rounded-md gap-2 w-fit bg-slate-300  px-5 py-2 font-semibold">
                    <ArrowLeft />
                    Back
                </div>

                <div className="flex md:flex-row flex-col w-full gap-6 items-start">
                    <div className="flex w-full md:w-1/2 border-2 border-slate-200 rounded-md overflow-hidden">
                        {
                            productData?.imageParams?.length === 1 ? (
                                <div className="flex items-center justify-center w-full">
                                    <img src={getImageUrl(productData.imageParams[0])} alt={productData.name} />
                                </div>
                            ) : (
                                <div>
                                    <Carousel className="relative">
                                        <CarouselContent>
                                            {
                                                productData?.imageParams?.map((image: string, index: number) => (
                                                    <CarouselItem key={index}>
                                                        <img src={getImageUrl(image)} alt={productData.name} />
                                                    </CarouselItem>
                                                ))
                                            }
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-2 top-1/2" />
                                        <CarouselNext className="absolute right-2 top-1/2" />
                                    </Carousel>

                                </div>
                            )
                        }

                    </div>

                    <div className="md:w-1/2 flex flex-col gap-4 text-left">
                        <div className=" flex flex-col gap-4 text-left">
                            <h1 className="text-3xl font-bold text-slate-800">{productData.name}</h1>
                            <p className="text-slate-600">{productData.description}</p>
                            {productData.offerDescription && (
                                <Badge variant="secondary" className="mb-2 w-fit">
                                    {productData.offerDescription}
                                </Badge>
                            )}
                            <p className="text-2xl font-bold text-slate-800">${productData?.price?.toFixed(2) || "no data"}</p>
                            <div className="flex gap-4">
                                <Button
                                    variant={"orangeGradient"}
                                    className="w-full"
                                    onClick={() => window.open(productData.url, "_blank")}
                                >
                                    Visit Site
                                </Button>
                                <Button
                                    className="bg-slate-200 w-full hover:bg-white rounded-md text-black border-2 hover:border-slate-500"
                                    onClick={() => setActiveDash("products")}
                                >
                                    Back to Products
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    else {
        return <div>
            No Category Found
        </div>
    }




}
import { ScrollArea } from "@/components/ui/scroll-area";
import { SERVER_URL } from "@/constant";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function AddProductForm() {
    const [allProduct, setAllProduct] = useState<string[]>([]);
    const [categoryData, setCategoryData] = useState<string[]>([]);
    const { userData } = useContext(AuthContext);
    const [isProductDataLoading, setIsProductDataLoading] = useState(false);
    const [isProductDataError, setIsProductDataError] = useState(false);
    const [productDataErrorMessage, setProductDataErrorMessage] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productUrl, setProductUrl] = useState("");
    const [offerDescription, setOfferDescription] = useState("");
    const [createCategoryError, setCreateCategoryError] = useState("");
    const [createProductError, setCreateProductError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // New loading state for form submissions
    const [productImage, setProductImage] = useState<File | null>(null)
    const [productImageUploading, setProductImageUploading] = useState(false)
    const [productImageCourser, setProductImageCourser] = useState<string[]>([])
    const [deletingObjectIndex, setDeletingObjectIndex] = useState<number>(-1)
    const [imageParams, setImageParams] = useState<string[]>([])
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string[]>([])
    const [price, setPrice] = useState<number>(0)
    const { toast } = useToast()
    console.log(categoryData, "categoryData")
    useEffect(() => {
        async function getProductData() {
            if (!(userData.role && (userData.role.includes("all") || userData.role.includes("add-product"))) || !userData.username) {
                setIsProductDataError(true);
                setProductDataErrorMessage("User not authenticated");
            } else {
                try {
                    setIsProductDataLoading(true);
                    const res = await axios.post(`${SERVER_URL}/api/v1/admin/getAllProducts`, {
                        username: userData.username
                    });
                    setAllProduct(res.data.data.product);
                    setCategoryData(res.data.data.catagory);
                    setIsProductDataError(false);
                } catch (error: any) {
                    setIsProductDataError(true);
                    setProductDataErrorMessage(error.response?.data?.message || "An error occurred while fetching products");
                } finally {
                    setIsProductDataLoading(false);
                }
            }
        }
        getProductData();
    }, [userData]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName) {
            setCreateCategoryError("Category name cannot be empty");
            return;
        }
        try {
            setIsSubmitting(true);
            const res = await axios.post(`${SERVER_URL}/api/v1/adsense/addNewCatagory`, {
                catagoryName: categoryName
            });
            setCategoryData([...categoryData, res.data.data]);
            setCategoryName("");
            setCreateCategoryError("");
            toast({
                title: "Category Created",
                description: "Category Created Successfully",
                variant: "default",
            })
            setCategoryData([res.data.data, ...categoryData]);
        } catch (error: any) {
            setCreateCategoryError(error.response?.data?.message || "An error occurred while creating category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !productDescription || !productUrl || !offerDescription || value.length <= 0 || imageParams.length <= 0) {
            setCreateProductError("All product fields must be filled ");
            return;
        }
        try {
            setIsSubmitting(true);
            const res = await axios.post(`${SERVER_URL}/api/v1/adsense/addNewProduct`, {
                name: productName,
                imageParams: imageParams,
                url: productUrl,
                description: productDescription,
                offerDescription: offerDescription,
                catagoryId: value,
                price: price,
            });
            if (!(res.status == 200)) {
                setCreateProductError(res.data.message)
                return
            }
            setAllProduct([...allProduct, res.data.data]);
            setProductName("");
            setProductDescription("");
            setProductUrl("");
            setOfferDescription("");
            setPrice(0)
            setCreateProductError("");
        } catch (error: any) {
            setCreateProductError(error.response?.data?.message || "An error occurred while creating product");
        } finally {
            setIsSubmitting(false);
        }
    };


    // called when user select file


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setProductImageUploading(true)
        if (e.target.files && e.target.files[0]) {

            setProductImage(e.target.files[0]);
            const presignedUrl = await axios.post(`${SERVER_URL}/api/v1/get-s3-presigned-url`, {
                filename: e.target.files[0].name,
                fileType: e.target.files[0].type
            })

            if (presignedUrl.status == 200) {
                const options = {
                    headers: {
                        'Content-Type': e.target.files[0].type
                    }
                }
                const uploader = await axios.put(presignedUrl.data.url, e.target.files[0], options)
                if (uploader.status == 200) {
                    console.log(presignedUrl.data.publicUrl, "here")
                    const newUrl = presignedUrl.data.publicUrl
                    setProductImageCourser([...productImageCourser, newUrl])
                    const key = newUrl.split(`${import.meta.env.VITE_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/`)[1];
                    console.log(key)
                    setImageParams([...imageParams, key])
                    setProductImageUploading(false)
                }
                else {
                    setCreateProductError("Can't Upload Image Right Now")
                }
            }
            e.target.files = null
        };
    }

    const handleImageDelete = async (index: number) => {
        try {
            setDeletingObjectIndex(index)
            // Extract the key from the imageUrl (after the S3 bucket domain)
            const imageUrl = productImageCourser[index];
            const key = imageUrl.split(`${import.meta.env.VITE_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/`)[1];

            if (!key) {
                throw new Error('Could not extract S3 key from the URL');
            }

            // Request a presigned URL for deletion
            const presignedDeleteUrlResponse = await axios.post(`${SERVER_URL}/api/v1/get-s3-presigned-delete-url`, {
                key: key
            });

            if (presignedDeleteUrlResponse.status === 200) {
                // Perform the delete operation by calling the presigned URL
                const deleteResponse = await axios.delete(presignedDeleteUrlResponse.data.url);
                console.log(deleteResponse)
                if (deleteResponse.status === 204) { // HTTP 204 No Content for a successful delete
                    console.log("Image deleted successfully");
                    // Update state accordingly (e.g., remove image from the list)
                    setProductImageCourser(prevImages => prevImages.filter(image => image !== imageUrl));
                } else {
                    throw new Error('Failed to delete image from S3');
                }
            }
        } catch (error: any) {
            console.error('Error deleting image:', error.message);
            setCreateProductError("Can't Delete Image Right Now");
        } finally {
            setDeletingObjectIndex(-1)

        }
    };

    return (
        <div>
            <h6 className="font-semibold">{"Reach > Add Product"}</h6>
            <hr className="border my-2 border-black" />

            <div className="flex w-full">
                <div className="w-1/2 h-full bg-gray-200 p-4 rounded-md">
                    <Tabs defaultValue="product" className="w-full border-none hover:border-none ring-none">
                        <TabsList>
                            <TabsTrigger value="product">Create Product</TabsTrigger>
                            <TabsTrigger value="catagory">Create Category</TabsTrigger>
                        </TabsList>
                        <TabsContent value="product">
                            <h6>Create New Product</h6>
                            <form onSubmit={handleCreateProduct}>
                                <div>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div>
                                    <label>Description</label>
                                    <textarea
                                        value={productDescription}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Enter product description"
                                    />
                                </div>
                                <div>
                                    <label>Product URL</label>
                                    <input
                                        type="text"
                                        value={productUrl}
                                        onChange={(e) => setProductUrl(e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Enter product URL"
                                    />
                                </div>
                                <div>
                                    <label>Offer Description</label>
                                    <input
                                        type="text"
                                        value={offerDescription}
                                        onChange={(e) => setOfferDescription(e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Enter offer description"
                                    />
                                </div>
                                <div>
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        value={price}
                                        min={0}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full p-2 border rounded bg-white"
                                    />
                                </div>
                                <div>
                                    <label> Select Catagory</label>
                                    <div>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-[550px] justify-between"
                                                >
                                                    Select Catagory
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[550px] p-0">
                                                <Command >
                                                    <CommandInput placeholder="Search framework..." />
                                                    <CommandList>
                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {categoryData.map((framework) => (
                                                                <CommandItem
                                                                    key={framework.catagoryName}
                                                                    value={framework._id}
                                                                    onSelect={(currentValue) => {

                                                                        if (value.includes(framework._id)) {
                                                                            setValue(value.filter((id) => id !== framework._id))
                                                                            console.log(value.filter((id) => id !== framework._id), "value")
                                                                            setOpen(false)
                                                                            return
                                                                        }
                                                                        if (value.length + 1 > 5) {
                                                                            setCreateProductError("You can't select more than 5 catagory")
                                                                            setOpen(false)
                                                                            return
                                                                        }
                                                                        setValue([...value, framework._id])
                                                                        console.log([...value, framework._id], "value")
                                                                        setOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4 text-black",
                                                                            value.includes(framework._id) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {framework.catagoryName}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <div className="p-4 ">
                                            <p>Select Again To Remove</p>
                                            <div className="flex gap-4">
                                                {
                                                    value.length > 0 && value.map((id) => (
                                                        <div className="bg-gray-200 border-2 border-black cursor-pointer  p-2 rounded-md m-1">
                                                            {categoryData.find((cat) => cat._id === id)?.catagoryName}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label>Display Photos</label>
                                    <div className="flex ">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="bg-white"
                                            onChange={handleImageUpload}
                                        />
                                        <div>
                                            {
                                                productImageUploading && <div className="flex gap-4">
                                                    <LoaderCircle className="animate-spin" />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap">
                                        {
                                            productImageCourser.length > 0 && productImageCourser.map((url, index) => (
                                                <div className="relative  border-2 border-gray-500 w-fit p-2  ">
                                                    <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full flex items-center justify-center">
                                                        <div className="bg-gray-300 w-fit h-fit flex justify-center items-center ">
                                                            {
                                                                deletingObjectIndex === index ? <div>
                                                                    <LoaderCircle className="animate-spin" />
                                                                    Deleting from Database
                                                                </div> : null
                                                            }

                                                        </div>

                                                    </div>
                                                    <div
                                                        onClick={() => { handleImageDelete(index) }}
                                                        className="absolute right-2 top-2 w-5 h-5 bg-gray-500 flex justify-center items-center rounded-md">
                                                        <X />
                                                    </div>
                                                    <img src={url} key={index} className="w-40 h-40 object-cover" />
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* error */}
                                {createProductError && (
                                    <div className="bg-red-400 p-2 rounded mt-2 flex justify-between items-center">
                                        <p>{createProductError}</p>
                                        <button onClick={() => setCreateProductError("")} className="text-white">Close</button>
                                    </div>
                                )}
                                <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Product"}
                                </button>
                            </form>
                        </TabsContent>
                        <TabsContent value="catagory">
                            <h6>Create New Category</h6>
                            <form onSubmit={handleCreateCategory}>
                                <div>
                                    <label>Category Name</label>
                                    <input
                                        type="text"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Enter category name"
                                    />
                                </div>
                                {createCategoryError && (
                                    <div className="bg-red-400 p-2 rounded mt-2 flex justify-between items-center">
                                        <p>{createCategoryError}</p>
                                        <button onClick={() => setCreateCategoryError("")} className="text-white">Close</button>
                                    </div>
                                )}
                                <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Category"}
                                </button>
                            </form>
                            <div>
                                <h6>Category List</h6>
                                <ul>
                                    {categoryData.map((category) => (
                                        <li>{category.catagoryName}</li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="w-1/2">
                    {isProductDataLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p>Loading products ...</p>
                        </div>
                    ) : isProductDataError ? (
                        <div className="w-full h-full border-2 border-red-500 bg-red-400">
                            <p>{productDataErrorMessage}</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            <h5 className="font-semibold text-xl">All Products of toolmate</h5>
                            <ScrollArea className="h-[calc(100vh-100px)] w-full flex-1 rounded-md border p-4">
                                {allProduct.map((product: any) => (
                                    <div key={product._id} className="border p-4 rounded-md flex gap-3 items-center">
                                        <div>
                                            {product.imageParams.length > 0 && (
                                                <img
                                                    src={`https://${import.meta.env.VITE_BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${product.imageParams[0]}`}
                                                    alt={product.name}
                                                    className="max-w-28 h-full border-2 border-gray-400 p-2 object-cover mb-2"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p>{product.description}</p>
                                            <p>Offer: {product.offerDescription}</p>

                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

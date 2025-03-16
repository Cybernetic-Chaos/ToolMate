import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useRef } from "react";
import { Separator } from "../ui/separator";
import { LoaderCircle } from "lucide-react";
import ProductDialog from "./ProductDialog";


interface Category {
  categoryName: string;
  products: any[];
}

interface AichatProps {
  id: string;
  message: string;
  productData: any[] | undefined;
  bunningsData: any;
  aiData: Category[];
  isProductLoading: boolean;
  isBunningLoading: boolean;
  isAiProductLoading: boolean;
}

export default function Aichat({
  id, message, productData, bunningsData, aiData, isProductLoading, isBunningLoading, isAiProductLoading
}: AichatProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showWorkerQueue, setShowWorkerQueue] = useState(false);
  const [productRendered, setProductRendered] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const messageRef = useRef<NodeJS.Timeout | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const handleStreaming = () => {
      setIsStreaming(true);
      setShowWorkerQueue(false);
      if (messageRef.current) {
        clearTimeout(messageRef.current);
      }
      messageRef.current = setTimeout(() => {
        setIsStreaming(false);
        if (productRendered) {
          setShowWorkerQueue(true);
        }
      }, 1000);
    };

    handleStreaming();
  }, [message, productRendered]);

  console.log(isStreaming, showWorkerQueue, productRendered, totalProducts, "isStreaming,showWorkerQueue,productRendered,totalProducts")


  useEffect(() => {
    if ((productData ?? []).length > 0) {
      setProductRendered(true);
    }
  }, [productData]);

  useEffect(() => {
    let total = 0;
    if (bunningsData) {
      console.log(bunningsData, "bunningsData")
      total += bunningsData.reduce((count: any, category: any) => count + category.products.length, 0);
    }
    if (aiData) {
      total += aiData.reduce((count, category) => count + category.products.length, 0);
    }
    if (productData) {
      total += productData.reduce((count, category) => count + category.products.length, 0);
    }
    setTotalProducts(total);
  }, [bunningsData, aiData, productData]);

  console.log("total", totalProducts);
  if (message === "") {
    return null;
  }
  console.log(bunningsData, "kjfssicoic")
  return (
    <div className="flex flex-col w-fit" key={id}>
      <div className="flex items-start gap-2 justify-start">
        <img src="/assets/matey-emoji/smile.svg" alt="matey" width={45} className="!rotate-3" />
        <div className="font-roboto custom-p flex flex-col w-fit bg-gray-100 p-3 rounded-md">
          {message === "" ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-3 w-full">
                <Skeleton className="h-4 w-[420px] bg-ligherYellow" />
                <Skeleton className="h-4 w-[220px] bg-ligherYellow" />
                <Skeleton className="h-4 w-[80px] bg-ligherYellow" />
                <Skeleton className="h-4 w-[330px] bg-ligherYellow" />
              </div>
              <div className="flex gap-3 w-full">
                <Skeleton className="h-4 w-[220px] bg-ligherYellow" />
                <Skeleton className="h-4 w-[80px] bg-ligherYellow" />
                <Skeleton className="h-4 w-[420px] bg-ligherYellow " />
                <Skeleton className="h-4 w-[330px] bg-ligherYellow " />
              </div>
            </div>
          ) : (
            <Markdown remarkPlugins={[remarkGfm]} className="text-black text-left">
              {message}
            </Markdown>
          )}






          {
            (isAiProductLoading || isBunningLoading || isProductLoading) && (
              <div
                className="bg-slate-200 border border-slate-400 w-fit h-16 flex items-center rounded-md overflow-hidden cursor-pointer hover:bg-slate-300 duration-150 group mt-3"
              >
                <div className="flex items-center bg-mangoYellow justify-center  w-16 z-10 h-16 flex-1 bg-cover bg-center">

                  <LoaderCircle className="w-8 h-8 flex items-center justify-center animate-spin " />
                </div>

                {/* <div className="flex items-center bg-mangoYellow justify-center  w-16 z-10 h-16 flex-1 bg-cover bg-center" style={{ backgroundImage: "url('/assets/icons/hammer.svg')", opacity: 0.8 }} /> */}
                <div className="p-4 flex flex-col text-left">
                  <p className="font-semibold text-slate-700 md:block hidden">Material And Product Suggestion</p>
                  <p className="font-semibold text-slate-700 md:hidden block">Product Suggestions</p>
                  {
                    totalProducts !== 0 ? (
                      <div className="flex gap-2 items-center w-full ">
                        <p className="font-semibold text-slate-500">{`${totalProducts == 1 ? "1 Item" : `${totalProducts} Items`}`}</p>
                        <div className="w-[5px] h-[5px] rounded-md bg-slate-500 " />
                        <p className="text-slate-500">Click To View</p>
                      </div>
                    ) : (
                      <p className="text-slate-500">Click To View</p>
                    )
                  }
                </div>
              </div>
            )
          }


          {
            (!isBunningLoading && !isProductLoading && !isAiProductLoading && (bunningsData?.length > 0 || (productData || [])?.length > 0 || aiData?.length > 0)) && (
              <div
                onClick={() => {
                  setDialogOpen(!isDialogOpen)
                }}
                className="bg-slate-200 border border-slate-400 w-fit h-16 flex items-center rounded-md overflow-hidden cursor-pointer hover:bg-slate-300 duration-150 group mt-3"
              >

                <div className="flex items-center bg-mangoYellow justify-center  w-16 z-10 h-16 flex-1 bg-cover bg-center" style={{ backgroundImage: "url('/assets/icons/hammer.svg')", opacity: 0.8 }} />
                <div className="p-4 flex flex-col text-left">
                  <p className="font-semibold text-slate-700 md:block hidden">Material And Product Suggestion</p>
                  <p className="font-semibold text-slate-700 md:hidden block">Product Suggestions</p>
                  {
                    totalProducts !== 0 ? (
                      <div className="flex gap-2 items-center w-full ">
                        <p className="font-semibold text-slate-500">{`${totalProducts == 1 ? "1 Item" : `${totalProducts} Items`}`}</p>
                        <div className="w-[5px] h-[5px] rounded-md bg-slate-500 " />
                        <p className="text-slate-500">Click To View</p>
                      </div>
                    ) : (
                      <p className="text-slate-500">Click To View</p>
                    )
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>

      <Separator orientation="vertical" className="border border-slate-300 w-full my-2" />
      {
        isDialogOpen && <ProductDialog isOpen={isDialogOpen} setIsOpen={setDialogOpen} bunningsProduct={bunningsData} vendorProduct={productData} mateyMadeProduct={aiData} />
      }
    </div>
  );
}


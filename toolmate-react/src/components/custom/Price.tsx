import { useContext, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@radix-ui/react-separator";
import { ArrowRight, Loader } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { pricing } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton"
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

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { useDebounce } from 'use-debounce';
import { calculateDiscountedPrice, calculateImpact, extractBAToken } from "@/lib/utils";
import { UserContext } from "@/context/userContext";
import FAQSection from "./FAQ";
import { usePriceContext } from "@/context/pricingContext";



export default function Price() {
  const location = useLocation()
  const currRoute = location.pathname
  const {
    priceData,
    sixMonthDiscount,
    yearlyDiscount,
    isPriceLoading,
  } = usePriceContext();
  const queryParams = new URLSearchParams(location.search)
  const redirected = queryParams.get('redirected');
  const [isShowContinueWithFree, setIsShowContinueWithFree] = useState(false)
  const { isSignedIn } = useUser();
  const { userData } = useContext(UserContext)
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("month");
  const [activePlan, setActivePlan] = useState<any>(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);

  const [continueToDashboard, setContinueToDashboard] = useState(false);
  // couponCode
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeDebouce] = useDebounce(couponCode, 1000);
  const [couponCodeValidationLoading, setCouponCodeValidationLoading] = useState(false);
  const [couponCodeError, setCouponCodeError] = useState("");
  const [couponCodeMessage, setCouponCodeMessage] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isCouponActive, setIsCouponActive] = useState(false);
  const [couponCodeDiscountPrice, setCouponCodeDiscountPrice] = useState(0);
  const [couponCodeImpact, setCouponCodeImpact] = useState(0);
  const [couponCodeDiscountPercentage, setCouponCodeDiscountPercentage] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  // get paypal url
  const [paypalLoading, setPaypalLoading] = useState(false);

  useEffect(() => {
    if (redirected) {
      setIsShowContinueWithFree(true)
    }
    return () => {
      setIsShowContinueWithFree(false)
    }
  }, [redirected])


  const { toast } = useToast();

  useEffect(() => {
    if (redirected) {
      setContinueToDashboard(true);
    }
  }, [redirected]);


  const handleTabChange = (value: any) => setActiveTab(value);

  const handleBuyNow = (planValue: string) => {
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "Please Sign In To Complete The Purchase",
        variant: "destructive",
      });
      navigate('/signup');
      return;
    }
    const activeTabObject: any = priceData.find((item: any) => item.tabName === activeTab);
    if (activeTabObject) {

      const activePlanObject = activeTabObject.list.find((item: any) => item.planValue === planValue);

      setActivePlan({ ...activePlanObject, duration: activeTabObject.tabName });
      console.log("activePlanObject", {
        ...activePlanObject,
        duration: activeTabObject.tabName,
      });
    }

    if (window.innerWidth <= 768) {
      setShowDrawer(true);
    }
    else {
      setShowCheckoutPopup(true);
    }
  };

  const handleCouponCode = (data: string) => setCouponCode(data);

  useEffect(() => {
    async function validateCouponCode() {
      setCouponCodeMessage("");
      setCouponCodeError("");
      setCouponCodeValidationLoading(true);

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getCouponCodeValidation`, { code: couponCodeDebouce });
        const { success, validationMessage, discount } = data;

        if (!success) {
          resetCouponState(validationMessage);
          return;
        }

        const priceDiscountImpact = calculateImpact(activePlan.priceInt, discount);
        const finalPrice = calculateDiscountedPrice(activePlan.priceInt, discount);

        setCouponCodeDiscountPrice(Number(finalPrice));
        setCouponCodeDiscountPercentage(discount);
        setCouponCodeImpact(Number(priceDiscountImpact));
        setCouponCodeMessage(validationMessage);
        setIsCouponApplied(true);
      } catch (error) {
        resetCouponState("Something went wrong. Please try again later.");
      } finally {
        setCouponCodeValidationLoading(false);
      }
    }

    if (couponCodeDebouce.length !== 0) {
      validateCouponCode();
    }
  }, [couponCodeDebouce]);

  const resetCouponState = (message: string) => {
    setCouponCodeValidationLoading(false);
    setCouponCodeMessage("");

    setCouponCodeDiscountPrice(0);
    setCouponCodeDiscountPercentage(0);
    setCouponCodeImpact(0);
    setCouponCodeError(message);
    setIsCouponActive(false);
    setIsCouponApplied(false);
  };

  const handleCouponApplied = () => {
    if (isCouponApplied) {
      setIsCouponActive(!isCouponActive);
    }
  };

  const handlePriceDialogClose = (value: boolean) => {
    if (!value) {
      setCouponCode("");
      resetCouponState("");
      setShowCheckoutPopup(false);
    }
  };

  async function getPaypalUrl() {
    if (paypalLoading) {
      return;
    }
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "Please Sign In To Complete The Purchase",
        variant: "destructive",
      });
      navigate('/signup');
      return;
    }
    setPaypalLoading(true);
    try {
      console.log("isCouponApplied", isCouponApplied, "isCouponActive", isCouponActive);
      let url;
      if (isCouponApplied && isCouponActive) {
        console.log("activePlan", activePlan, userData);
        const discountPayPal = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/payment`, {
          productId: activePlan.productId,
          userId: userData?.id,
          isCouponCodeApplied: true,
          planName: activePlan.title,
          CouponCode: couponCode
        });

        url = discountPayPal.data.url;
        console.log("url", url);
        const urlBaValue = extractBAToken(url);
        const localValue = {
          ba: urlBaValue,
          Packname: activePlan.title,
          price: activePlan.price,
        };
        localStorage.setItem("paypalData", JSON.stringify(localValue));
        window.location.href = url; // Redirect to PayPal URL directly

        console.log("discountPayPal", discountPayPal);
      } else {
        console.log("activePlan", activePlan, userData);
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/payment`, {
          productId: activePlan.productId,
          userId: userData?.id,
          isCouponCodeApplied: false,
          CouponCode: null,
          planName: activePlan.title
        });
        url = res.data.url;
        console.log("url", url);
        const urlBaValue = extractBAToken(url);
        const localValue = {
          ba: urlBaValue,
          Packname: activePlan.title,
          price: activePlan.price,
        };
        localStorage.setItem("paypalData", JSON.stringify(localValue));
        window.location.href = url; // Redirect to PayPal URL directly

        console.log("res", res);
      }
    } catch (error) {
      console.error("Error fetching PayPal URL", error);
    } finally {
      setPaypalLoading(false);
    }
  }


  return (
    <div className="w-full h-full">
      <Tabs
        defaultValue="month"
        className="w-full my-10 flex flex-col items-center"
        onValueChange={handleTabChange}
      >
        <div className="w-full h-full flex justify-center">
          <TabsList className="bg-slate-100 border-2 border-slate-600 flex md:flex-row flex-col md:w-fit h-full md:h-fit w-full">
            <TabsTrigger
              value="month"
              className={`md:px-14 flex justify-center items-center gap-2 w-full   ${activeTab === "month" ? "bg-gray-200" : ""
                }`}
            >
              <div className="flex justify-between w-full items-center gap-2">
                <p className="text-black">1 Months</p>
                <div className="rounded-full bg-orange text-white px-2"></div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="months"
              className={`md:px-14 flex md:justify-center  items-center gap-2 w-full    ${activeTab === "months" ? "bg-gray-200" : ""
                }`}
            >
              <div className="flex justify-between w-full items-center gap-2">
                <p className="text-black">6 Months</p>
                {
                  !isPriceLoading && sixMonthDiscount > 0 && <div className="rounded-full bg-orange text-white px-2">
                    {sixMonthDiscount}% Off
                  </div>
                }
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className={`md:px-14 flex md:justify-center  items-center gap-2 w-full    ${activeTab === "year" ? "bg-gray-200" : ""
                }`}
            >
              <div className="flex justify-between w-full items-center gap-2">
                <p className="text-black">12 Months</p>
                {
                  !isPriceLoading && sixMonthDiscount > 0 && <div className="rounded-full bg-orange text-white px-2">
                    {yearlyDiscount}% Off
                  </div>
                }
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="w-full  md:px-16">
          {pricing.map((priceItem, index) => (
            <TabsContent
              value={priceItem.tabName}
              className={`flex md:flex-row gap-5 flex-col w-full justify-between  ${activeTab === priceItem.tabName ? "tab-content-active" : ""
                }`}
              key={index}
            >
              {priceItem.list.map((item) => (
                <div
                  className="md:flex  md:flex-col w-full md:w-1/3 md:m-2 p-4 text-left rounded-lg "
                  style={{
                    background: `linear-gradient(90deg, ${item.color[0]} 0%, ${item.color[1]} 100%)`,
                  }}
                >
                  {/* heading */}
                  <div className="flex gap-4">
                    <img src={item.icons} alt="icon" width={30} />
                    <p className="text-xl md:text-2xl font-bold">{item.title}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {
                      isPriceLoading ? <div>
                        <Skeleton className="w-full h-[10px] rounded-sm mt-4 mb-1  bg-lightOrange" />
                        <Skeleton className="w-2/3 h-[10px] rounded-sm mt-2 mb-1  bg-lightOrange" />
                      </div> :
                        <p className="text-xl md:text-2xl font-medium">
                          {item.price}
                        </p>
                    }

                  </div>

                  <div className="py-4">
                    {item.isActivePlan ? (
                      <Button
                        variant={"default"}
                        size={"StretchedButton"}
                        onClick={() => {
                          if (isSignedIn) {
                            navigate('/dashboard')
                            return;
                          }
                          navigate('/signup')
                        }}
                        className="w-full bg-slate-300 hover:bg-slate-100  border-black  text-black font-semibold"
                      >
                        {
                          isSignedIn ? "Continue With Free Plan" : "Sign In"
                        }
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleBuyNow(item.planValue)}
                        className="bg-orange w-full hover:bg-lightOrange border-2 border-orange"
                      >
                        Buy Now
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    {item.featureList.map((feature) => (
                      <div key={feature.title}>
                        <div className="flex gap-2 items-start p-2">
                          {feature.isTicked ? (
                            <img
                              src="/assets/icons/check.svg"
                              className="mt-2 mr-2"
                              alt="check"
                              width={20}
                            />
                          ) : (
                            <img
                              src="/assets/icons/unchecked.svg"
                              alt="unchecked"
                            />
                          )}
                          <div className="flex flex-col gap-2">
                            <p className="font-bold">{feature.title}</p>
                            <p>{feature.desc}</p>
                          </div>
                        </div>
                        <Separator
                          orientation="horizontal"
                          className={`${feature.isLineBelow ? "block" : "hidden"
                            } border border-slate-600`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {
        isShowContinueWithFree && <div
          onClick={() => navigate('/dashboard')}
        >
          <p className="font-semibold text-slate-500 underline -mt-10 cursor-pointer">Continue With Free Plan</p>
        </div>
      }
      {
        (activePlan && activeTab) && <Dialog open={showCheckoutPopup} onOpenChange={handlePriceDialogClose}>
          <DialogContent className="md:h-[calc(100%-10rem)] md:w-[calc(100%-30rem)] flex md:flex-row flex-col max-w-full">
            <DialogTitle></DialogTitle>
            <div className="flex gap-2 w-2/5 items-start p-4 h-fit  bg-gradient-to-t from-softYellow to-paleYellow  rounded-lg">
              <div className="flex gap-4 items-start">
                <img src={activePlan.icons} alt="icon" width={30} />
                <div className="flex flex-col items-start">
                  <p className="font-semibold text-xl">{activePlan.title}</p>
                  <p>{activePlan.duration == "month" ? "1 Month Plan" : (activePlan.duration == "months" ? "6 Month Plan" : " Yearly Plan")}</p>
                </div>

              </div>

            </div>
            <div className="flex gap-2 w-3/5 h-full">
              <div className="w-full flex flex-col items-start">
                <p className="font-semibold">Enter Coupon Code</p>
                <div className="border-2 flex gap-2  border-slate-200 w-full h-fit rounded-lg mr-5">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    onChange={(e) => handleCouponCode(e.target.value)}
                    value={couponCode}
                    className="px-4 py-2 w-full focus-visible:outline-none"
                  />
                  <button
                    onClick={handleCouponApplied}
                    className={`${couponCode.length !== 0 ? "block" : "hidden"} font-semibold px-2`}>
                    {isCouponApplied ? (isCouponActive ? "Remove" : "Apply") : "Apply"}
                  </button>

                </div>
                {
                  couponCodeValidationLoading && <div className="flex gap-2 mt-2 items-center">
                    <Loader className="animate-spin w-6 h-6" />
                    <p>Checking Coupon...</p>
                  </div>
                }
                {
                  couponCodeMessage.length > 0 && <div>
                    <p className="text-green-400">{couponCodeMessage}</p>
                  </div>
                }
                {
                  couponCodeError.length > 0 && <div>
                    <p className="text-red-400">{couponCodeError}</p>
                  </div>
                }


                <div className="h-full w-full flex flex-col gap-2 items-start mt-6">
                  {/* total */}
                  <div>
                    <p className="font-semibold text-xl">Subscription Summary</p>
                  </div>
                  <div className="w-full mt-2 mb-2 flex justify-between px-4 py-2  ">
                    <div className="flex flex-col items-start ">
                      <div className="flex items-center justify-center  gap-2">
                        <p className="font-semibold text-lg ">{activePlan.title}</p>
                        <div className="bg-black rounded-full w-[6px] h-[6px]"></div>
                        <p className=" text-lg text-slate-400">{activePlan.duration == "month" ? "1 Month Plan" : (activePlan.duration == "months" ? "6 Month Plan" : " Yearly Plan")}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-lg">{activePlan.price}</p>
                    </div>
                  </div>
                  {
                    isCouponApplied && isCouponActive &&
                    <div className="w-full">
                      <hr className="border w-full border-slate-200" />
                      <div className="flex justify-between w-full items-center px-4 py-2   ">
                        <div className="flex gap-2 items-center ">
                          <p className="font-semibold">{couponCode}</p>
                          <div className="bg-black rounded-full w-[6px] h-[6px] font-semibold"></div>
                          <p className="text-lg text-slate-400">{couponCodeDiscountPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-lg">- {couponCodeImpact} $</p>
                        </div>
                      </div>
                    </div>
                  }
                  <hr className="border w-full border-slate-700" />
                  <div className="flex justify-between items-center w-full px-4 ">
                    <p className="font-semibold text-lg">Total</p>
                    <p className="text-lg">{isCouponActive ? couponCodeDiscountPrice : activePlan.priceInt} $</p>

                  </div>
                </div>
                <div className="w-full mt-4 flex flex-wrap gap-2 leading-3 my-3">
                  By clicking on the button below, you agree to our <Link target="_blank" to="/terms-of-service" className="font-semibold underline">Terms of Service</Link>, <Link target="_blank" to="/privacy-policy" className="font-semibold underline">Privacy Policy</Link> and <Link to="/refund-policy" target="_blank" className="font-semibold underline">Refund Policy</Link>
                </div>
                <button
                  onClick={getPaypalUrl}
                  className="bg-softYellow w-full flex items-center justify-center py-3 font-semibold border border-yellow hover:bg-lightYellow transition-all rounded-lg"
                >
                  {
                    paypalLoading ? <div className="flex gap-2 ">
                      <Loader className="animate-spin w-6 h-6" />
                      <p>Loading Payment Page...</p>
                    </div> :
                      <div className="flex gap-2">
                        Complete The Order
                        <ArrowRight className="w-6 h-6" />

                      </div>
                  }
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }



      {
        activePlan && <Drawer open={showDrawer} onOpenChange={(value) => {
          if (!value) {
            // reset coupon state
            setCouponCode("");
            resetCouponState("");
          }
          setShowDrawer(value);
        }}>
          <DrawerContent className="h-[calc(100%-1rem)] px-2 py-7 flex flex-col gap-2 ">
            <div className="flex gap-2  w-full items-start p-4 h-fit  bg-gradient-to-t from-softYellow to-paleYellow  rounded-lg">
              <div className="flex gap-4 items-start">
                <img src={activePlan.icons} alt="icon" width={30} />
                <div className="flex flex-col items-start">
                  <p className="font-semibold text-xl">{activePlan.title}</p>
                  <p>{activePlan.duration == "month" ? "1 Month Plan" : (activePlan.duration == "months" ? "6 Month Plan" : " Yearly Plan")}</p>
                </div>

              </div>

            </div>
            <div className="flex gap-2 w-full h-full">
              <div className="w-full flex flex-col items-start overflow-y-scroll">
                <p className="font-semibold">Enter Coupon Code</p>
                <div className="border-2 flex gap-2  border-slate-200 w-full h-fit rounded-lg mr-5">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    onChange={(e) => handleCouponCode(e.target.value)}
                    value={couponCode}
                    className="px-4 py-2 w-full focus-visible:outline-none"
                  />
                  <button
                    onClick={handleCouponApplied}
                    className={`${couponCode.length !== 0 ? "block" : "hidden"} font-semibold px-2`}>
                    {isCouponApplied ? (isCouponActive ? "Remove" : "Apply") : "Apply"}
                  </button>

                </div>
                {
                  couponCodeValidationLoading && <div className="flex gap-2 mt-2 items-center">
                    <Loader className="animate-spin w-6 h-6" />
                    <p>Checking Coupon...</p>
                  </div>
                }
                {
                  couponCodeMessage.length > 0 && <div>
                    <p className="text-green-400">{couponCodeMessage}</p>
                  </div>
                }
                {
                  couponCodeError.length > 0 && <div>
                    <p className="text-red-400">{couponCodeError}</p>
                  </div>
                }


                <div className="h-full w-full flex flex-col gap-2 items-start mt-6">
                  {/* total */}
                  <div>
                    <p className="font-semibold text-xl">Subscription Summary</p>
                  </div>
                  <div className="w-full mt-2 mb-2 flex justify-between px-4 py-2  ">
                    <div className="flex flex-col items-start ">
                      <div className="flex flex-col items-start justify-start  gap-2">
                        <p className="font-semibold text-lg ">{activePlan.title}</p>
                        <p className=" text-lg text-slate-400">{activePlan.duration == "month" ? "1 Month Plan" : (activePlan.duration == "months" ? "6 Month Plan" : " Yearly Plan")}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <p className="text-lg">{activePlan.price}</p>
                    </div>
                  </div>
                  {
                    isCouponApplied && isCouponActive &&
                    <div className="w-full">
                      <hr className="border w-full border-slate-200" />
                      <div className="flex justify-between w-full items-center px-4 py-2   ">
                        <div className="flex gap-2 items-center ">
                          <p className="font-semibold">{couponCode}</p>
                          <div className="bg-black rounded-full w-[6px] h-[6px] font-semibold"></div>
                          <p className="text-lg text-slate-400">{couponCodeDiscountPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-lg">- {couponCodeImpact} $</p>
                        </div>
                      </div>
                    </div>
                  }
                  <hr className="border w-full border-slate-700" />
                  <div className="flex justify-between items-center w-full px-4 ">
                    <p className="font-semibold text-lg">Total</p>
                    <p className="text-lg">{isCouponActive ? couponCodeDiscountPrice : activePlan.priceInt} $</p>

                  </div>
                </div>
                <div className="w-full mt-4 flex flex-col md:flex-row flex-wrap gap-2 leading-3 my-3 text-center">
                  By clicking the button below, you agree to our
                  <Link target="_blank" to="/terms-of-service" className="font-semibold underline mx-1">Terms of Service</Link>
                  <Link target="_blank" to="/privacy-policy" className="font-semibold underline mx-1">Privacy Policy </Link>
                  <Link target="_blank" to="/refund-policy" className="font-semibold underline mx-1">Refund Policy</Link>.
                </div>
                <button
                  onClick={getPaypalUrl}
                  className="bg-softYellow w-full flex items-center justify-center py-3 font-semibold border border-yellow hover:bg-lightYellow transition-all rounded-lg"
                >
                  {
                    paypalLoading ? <div className="flex gap-2 ">
                      <Loader className="animate-spin w-6 h-6" />
                      <p>Loading Payment Page...</p>
                    </div> :
                      <div className="flex gap-2">
                        Complete The Order
                        <ArrowRight className="w-6 h-6" />

                      </div>
                  }
                </button>
              </div>
            </div>

          </DrawerContent>
        </Drawer>

      }


      <FAQSection isVisible={currRoute == "/"} />
    </div>
  );
}

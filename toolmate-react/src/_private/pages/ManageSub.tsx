import React, { useContext, useEffect, useState } from "react";
import Logo from "@/components/custom/Logo";
import { CreditCard, BadgeCheck, DollarSign, RefreshCw, ChevronDown, ChevronRight, Logs, LoaderCircle, TriangleAlert, ArrowDownToLine, Ban, FolderKanban, TicketSlash, Hand, OctagonX, Diamond, Info, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import MateyExpression from "@/components/custom/MateyExpression";
import { useAuth } from "@clerk/clerk-react";
import { useSubscription } from "@/context/SubscriptionDetailsContext";
import { UserContext } from "@/context/userContext";
import { Skeleton } from "@/components/ui/skeleton"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { Link } from "react-router-dom";
import { pricing } from "@/constants";
import { usePriceContext } from "@/context/pricingContext";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { RefundLogsTable } from "@/components/custom/tables/tables/Refund-log-table";
export default function ManageSub() {
    const [activeTab, setActiveTab] = useState("details");
    const { userData } = useContext(UserContext);
    const {
        sixMonthDiscount,
        yearlyDiscount,
        isPriceLoading,
        priceData
    } = usePriceContext()
    const {
        subscriptionData,
        paymentLogs,
        isLoading,
        error,
        fetchSubscriptionDetails,
        fetchPaymentLogs,
        requestSubscriptionPause,
        isRequestSubscriptionPauseLoading,
        isSuspendRequested,
        isCancelRequested,
        isProPlanSubscribed,
        isSuspended,
        isCancelSuspendLoading,
        isCancelDowngradeLoading,
        handleRemovePauseSubscription,
    } = useSubscription();
    console.log(subscriptionData, "subscriptionData");
    const [isInfoPanalOpen, setIsInfoPanalOpen] = useState(false);
    const [panalFlag, setPanalFlag] = useState<"suspend" | "cancel" | "downgrade">("suspend");
    // dialogs 
    const [isSuspendOpen, setIsSuspendOpen] = useState(false); // suspend subscription request
    const [isCancelOpen, setIsCancelOpen] = useState(false); // cancel subscription request
    const [isDowngradeOpen, setIsDowngradeOpen] = useState(false); // downgrade subscription request
    const [isResumeOpen, setIsResumeOpen] = useState(false); // resume subscription request
    const [isCancelSuspendOpen, setIsCancelSuspendOpen] = useState(false); // cancel suspend request
    const [isCancelDowngradeOpen, setIsCancelDowngradeOpen] = useState(false); // cancel downgrade request
    const [isCancelCancelOpen, setIsCancelCancelOpen] = useState(false); // cancel cancel request
    const [isSuspendLoading, setIsSuspendLoading] = useState(false);
    // refund states
    const [isRefundEligible, setIsRefundEligible] = useState(false); // refund eligibility
    const [nonEligibleReason, setNonEligibleReason] = useState(""); // refund eligibility reason
    const [refundLogs, setRefundLogs] = useState([]); // refund logs
    const [isRefundElibileStatusLoading, setIsRefundElibileStatusLoading] = useState(false); // refund request loading
    const [isRefundLogsLoading, setIsRefundLogsLoading] = useState(false); // refund logs loading
    const [isNoRefundLogs, setIsNoRefundLogs] = useState(false); // no refund logs
    // refund request
    const [isRefundRequestLoading, setRefundRequestLoading] = useState(false);
    const [isRefundSuccess, setIsRefundSuccess] = useState(false);
    const [isRefundFailed, setIsRefundFailed] = useState(false);
    const [refundRequestError, setRefundRequestError] = useState("");

    // pause subscription request
    const tabs = [
        { id: "details", label: "Plan Information", icon: CreditCard },
        { id: "curr", label: "Subscription Management", icon: BadgeCheck },
        { id: "logs", label: "Activity", icon: Logs },
        { id: "refund", label: "Refund Management", icon: RefreshCw },
    ];

    // refund request
    async function getRefunfRequest() {
        setRefundRequestLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/requestRefund`, {
                userId: userData?.id
            });
            if (res.data.success) {
                setIsRefundSuccess(true);
                toast({
                    title: "Success",
                    description: "Refund Request Sent Successfully",
                    variant: "success"
                })
            } else {
                setIsRefundFailed(true);
                setRefundRequestError(res.data.message);
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            setIsRefundFailed(true);
            setRefundRequestError(error.message);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setRefundRequestLoading(false);
        }
    }


    async function getRefundLogs() {
        setIsRefundLogsLoading(true);
        try {

            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getRefundLogs`, {
                userId: userData?.id
            });
            if (!res) {
                toast({
                    title: "Error",
                    description: "No Refund Logs Found",
                    variant: "destructive"
                })
            }
            if (res.data.logs.length === 0) {
                setIsNoRefundLogs(true);
            }

            setRefundLogs(res.data.logs);

        } catch (error: any) {
            toast({
                title: "Error Occured",
                description: error.message,
                variant: "destructive"
            })

        } finally {
            setIsRefundLogsLoading(false);
        }
    }

    // effect for refund related data
    useEffect(() => {
        if (activeTab === "refund") {
            fetchRefundData();
        }
        async function fetchRefundData() {
            setIsRefundElibileStatusLoading(true);
            try {
                const { data } = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getRefundEligibilityStatus`, {
                    userId: userData?.id
                })

                setIsRefundEligible(data.isEligible);
                if (!data.isEligible) {
                    setNonEligibleReason(data.message)
                }
            } catch (error: any) {
                toast({
                    title: "Error Occured",
                    description: error.message,
                    variant: "destructive"
                })

            } finally {
                setIsRefundElibileStatusLoading(false)
            }
        }
    }, [activeTab, userData]);


    useEffect(() => {
        if (userData && userData.activePlan) {
            fetchSubscriptionDetails(userData.activePlan as string);
        }
        if (userData && userData.id) {
            fetchPaymentLogs(userData.id);

        }
    }, [userData]);
    // side effect : when payment log is updated
    useEffect(() => {
        console.log(paymentLogs, "paymentLogs");
        const lastLog = paymentLogs[0];
        // intitalize the values of panel 
        console.log(lastLog, "lastLog");
        if (paymentLogs.length > 0) {
            if (lastLog.status === "suspend request saved to the queue") {
                setIsInfoPanalOpen(true);
                setPanalFlag("suspend");
            } else if (lastLog.status === "cancel request saved to the queue") {
                setIsInfoPanalOpen(true);
                setPanalFlag("cancel");
            } else if (lastLog.status === "downgrade request saved to the queue") {
                setIsInfoPanalOpen(true);
                setPanalFlag("downgrade");
            }
        }
    }, [paymentLogs, isSuspendRequested, isCancelRequested, isProPlanSubscribed, isSuspended]);
    function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
        return (
            <div className="flex items-center space-x-3 text-left">
                <div className="bg-slate-100 p-2 rounded-full">{icon}</div>
                <div>
                    <p className="text-sm sm:text-base font-medium text-slate-600">{label}</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-900">{value}</p>
                </div>
            </div>
        );
    }

    console.log(pricing, "priceinggg")

    function CurrentPlanDetails() {
        const [isShowCycleDetails, setIsShowCycleDetails] = useState(false);

        if (!subscriptionData) return null;

        return (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 overflow-scroll">
                {
                    isInfoPanalOpen && (
                        <Card className={`w-full p-4 m-4 ${panalFlag === "suspend" ? "bg-lighterYellow border-yellow" : panalFlag === "cancel" ? "bg-red-50 border-red-500" : "bg-blue-50 border-blue-500"} border-2`}>
                            {
                                panalFlag === "suspend" && (
                                    <div className="">
                                        <div className="flex gap-4 items-center">
                                            <TriangleAlert width={30} height={30} />
                                            <div className="flex flex-col justify-start items-start">
                                                <p className="font-semibold text-lg">Suspend Requested</p>
                                                <p>Your Suspent request will take effect at the end of this billing cycle</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger className="flex flex-col justify-start px-4 py-1 my-4 border-2 border-yellow rounded-md font-semibold bg-softYellow hover:bg-lightYellow">How It Works ?</AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>How Suspention Of subscription works!</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            <ul className="list-disc pl-5 space-y-2">
                                                                <li>No refund will be initiated as you have already been charged for the service.</li>
                                                                <li>You can continue using the service until the next billing cycle.</li>
                                                                <li>You will not be charged for next billing cycle</li>
                                                                <li>The suspension will take effect at the start of the next billing cycle, not immediately.</li>
                                                                <li>You can resume the subscription at any time after the suspension date.</li>
                                                            </ul>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="font-semibold  bg-softYellow hover:bg-paleYellow">Got It</AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <div className="border-yellow border-2 rounded-md bg-mangoYellow hover:bg-softYellow cursor-pointer px-4 py-1 my-4">
                                                Manage Subscription
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                panalFlag === "cancel" && (
                                    <div>
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <Ban className="text-red-500" />
                                                <div className="flex flex-col items-start justify-start">
                                                    <p className="font-semibold text-lg">Cancellation Requested</p>
                                                    <p>Your Cancellation request will take effect at the end of this billing cycle</p>
                                                </div>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger className="flex flex-col justify-start px-4 py-1 my-4 border-2 border-red-500 rounded-md font-semibold bg-red-50 hover:bg-red-100">
                                                    How Cancellation Works?
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Subscription Cancellation Policy</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            <ul className="list-disc pl-5 space-y-2">
                                                                <li>Your cancellation will take effect at the end of the current billing cycle.</li>
                                                                <li>You will retain access to premium features until the subscription period ends.</li>
                                                                <li>No prorated refunds will be provided for the remaining portion of the billing cycle.</li>
                                                                <li>You can cancel via your account dashboard or by emailing support.</li>
                                                                <li>Full refunds are available only within 7 days of initial purchase if no premium features were used.</li>
                                                            </ul>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="font-semibold bg-red-50 hover:bg-red-100">
                                                            Got It
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                panalFlag === "downgrade" && (
                                    <div>
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <ArrowDownToLine className="text-blue-500" />
                                                <p className="font-semibold text-lg">Downgrade Requested</p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger className="flex flex-col justify-start px-4 py-1 my-4 border-2 border-blue-500 rounded-md font-semibold bg-blue-50 hover:bg-blue-100">
                                                    How Downgrade Works?
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Subscription Downgrade Policy</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            <ul className="list-disc pl-5 space-y-2">
                                                                <li>Downgrade will take effect at the end of your current billing cycle.</li>
                                                                <li>No refunds or credits will be issued for the remaining period of the higher-tier plan.</li>
                                                                <li>You can continue using current plan features until the next billing cycle.</li>
                                                                <li>Your new plan will be active from the start of the next billing cycle.</li>
                                                                <li>All existing data and settings will be preserved during the downgrade process.</li>
                                                            </ul>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="font-semibold bg-blue-50 hover:bg-blue-100">
                                                            Got It
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )
                            }
                        </Card>

                    )
                }


                <Card className="w-full bg-white shadow-lg">

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                            <Badge variant="outline" className="text-slate-500 border-yellow border-2">
                                {subscriptionData.planName}
                            </Badge>
                            <span className="text-sm text-slate-600">
                                Last Updated: {new Date(subscriptionData.planLastUpdated).toLocaleString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem
                                icon={<CreditCard className="w-5 h-5" />}
                                label="Subscription ID"
                                value={subscriptionData.subscriptionId}
                            />
                            <InfoItem
                                icon={<CreditCard className="w-5 h-5" />}
                                label="Price Paid"
                                value={String(subscriptionData.pricePaid)}
                            />
                            <InfoItem
                                icon={<CalendarDays className="w-5 h-5" />}
                                label="Next Billing Cycle"
                                value={new Date(subscriptionData.nextBillingCycle).toLocaleString()}
                            />
                            <InfoItem
                                icon={<CalendarDays className="w-5 h-5" />}
                                label="Plan Started On"
                                value={new Date(subscriptionData.planStartedOn).toLocaleString()}
                            />
                            <InfoItem
                                icon={<CalendarDays className="w-5 h-5" />}
                                label="Last Paid On"
                                value={new Date(subscriptionData.lastPaidOn).toLocaleString()}
                            />
                            <div className="w-fit h-full flex gap-2">
                                <InfoItem
                                    icon={<Diamond className="w-5 h-5" />}
                                    label="Plan Status"
                                    value={subscriptionData.planStatus}
                                />
                                <div>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <Info width={15} height={15} />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-softYellow font-semibold text-black">
                                                <p className="max-w-2xl">If you have requested a subscription change (suspend, cancel, or downgrade), the status will update immediately, but the changes will take effect at the end of the current billing cycle.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-slate-50 rounded-lg w-full">
                    <div
                        className="flex my-2 gap-2 items-center cursor-pointer text-slate-600 hover:text-slate-800 transition-colors duration-200"
                        onClick={() => setIsShowCycleDetails(!isShowCycleDetails)}
                    >
                        <p className="font-semibold px-3 py-2">Cycle Details</p>
                        {isShowCycleDetails ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    {isShowCycleDetails && <CycleLogCard log={subscriptionData.cycleExecutionLogs} />}
                </div>
            </div>
        );  
    }

    function CycleLogCard({ log }: { log: any[] }) {
        const keys = log.length > 0 ? Object.keys(log[0]) : [];

        return (
            <Table className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                <TableHeader>
                    <TableRow>
                        {keys.map((key) => (
                            <TableCell key={key} className="font-medium text-slate-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1").replace("_", " ").trim()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {log.map((entry, index) => (
                        <TableRow key={index}>
                            {keys.map((key) => (
                                <TableCell key={key} className="text-slate-700">
                                    {entry[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    function PlanInfoTab() {
        if (isLoading) {
            return (
                <div className="w-full p-4 m-4 text-center h-full flex flex-col border-2 border-slate-200 text-slate-600 rounded-md items-center justify-center">
                    <LoaderCircle className="animate-spin" />
                    <span className="ml-2">Loading Subscription Details...</span>
                </div>
            );
        }

        if (!subscriptionData) {
            return (
                <div className="flex flex-col border-slate-200 border-2 rounded-md p-4 m-4">
                    <div className="flex flex-col gap-2 justify-center items-center font-semibold leading-7">
                        <MateyExpression expression="2thumb" />
                        <p className="text-lg">You currently do not have any active plans.</p>
                        <p className="font-semibold text-slate-600">Explore Exciting Features Of Toolmate</p>
                        <Link to="/pricing">
                            <a className="bg-yellow text-white px-4 py-2 rounded-md hover:bg-lightYellow">Explore Plans</a>
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <>
                <CurrentPlanDetails />
            </>
        );
    }

    function PaymentLogs() {
        if (paymentLogs.length === 0) {
            return <div className="w-full p-4 text-center">No subscription logs found.</div>;
        }

        return (
            <div className="w-full p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-[#FF8F00]">Subscription ID</TableHead>
                            <TableHead className="text-[#FF8F00]">Plan Name</TableHead>
                            <TableHead className="text-[#FF8F00]">Coupon Applied</TableHead>
                            <TableHead className="text-[#FF8F00]">Coupon Code</TableHead>
                            <TableHead className="text-[#FF8F00]">Base Billing Plan ID</TableHead>
                            <TableHead className="text-[#FF8F00]">Status</TableHead>
                            <TableHead className="text-[#FF8F00]">Activity Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentLogs.map((payment, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium text-[#FF5900]">
                                    {payment.subscriptionId}
                                </TableCell>
                                <TableCell>{payment.planName}</TableCell>
                                <TableCell>{payment.isCouponApplied ? "Yes" : "No"}</TableCell>
                                <TableCell>{payment.couponCode || "-"}</TableCell>
                                <TableCell>{payment.baseBillingPlanId || "-"}</TableCell>
                                <TableCell className={payment.status.includes("ACTIVE") ? "text-green-600" : "text-red-600"}>
                                    {payment.status}
                                </TableCell>
                                <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    function SubscriptionDetails() {
        return <div>
            <div className="flex md:flex-row flex-col gap-4 w-full ">
                <Card className={`w-full rounded-2xl md:h-72 h-48 bg-white ${userData?.planAccess[1] ? "shadow-yellow border-2 shadow-lg border-goldenYellow" : "shadow-lg"} mt-4`}>
                    <CardContent className="p-4 sm:p-6 space-y-3 flex justify-between h-full flex-col">
                        <div className="space-y-3">
                            <div>
                                <img src="/assets/icons/gear.svg" className="w-10 h-10" />
                            </div>
                            <div className="  flex justify-start items-center gap-2">
                                <p className="text-yellow font-bold text-2xl">Toolmate Essential</p>
                                {
                                    userData?.planAccess[1] && (
                                        <Badge variant="outline" className="px-4 py-1 border-yellow border-2 rounded-md bg-lightYellow text-black">
                                            currently Active
                                        </Badge>
                                    )
                                }
                            </div>
                        </div>
                        {/* downgrade  */}
                        <div className={`${userData?.planAccess[1] ? "hidden" : "block w-full "}`}>
                            {
                                isPriceLoading ? <div className="flex gap-2 ">
                                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                                </div> : <AlertDialog
                                    onOpenChange={(isOpen) => {
                                        if (isCancelRequested || isSuspendRequested) {
                                            return;
                                        }
                                        setIsDowngradeOpen(isOpen);
                                    }}
                                    open={(isCancelRequested || isSuspendRequested) ? isDowngradeOpen : undefined}>
                                    <AlertDialogTrigger className="w-full">
                                        <div className="font-semibold w-full bg-slate-200 rounded-md shadow-md py-2 hover:bg-slate-300">
                                            Down Grade
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <ul>
                                                    <li>Your down Grade Request will take effect at the end of this billing cycle</li>
                                                    <li>after this billing cycle over,Your subscription will be converted from <b>Toolmate Pro</b> To <b>Toolmate Essential</b> </li>
                                                </ul>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => requestSubscriptionPause(true, "downgrade", userData?.planAccess[2] ? 1 : 0)}
                                                className="bg-blue-400 hover:bg-blue-600"
                                            >
                                                {
                                                    isRequestSubscriptionPauseLoading ?
                                                        <div className="animate-spin">
                                                            <LoaderCircle />
                                                        </div> : "Confirm Downgrade"
                                                }
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }

                        </div>





                    </CardContent>
                </Card>
                <Card className={`w-full rounded-2xl justify-between md:h-72 h-48 bg-white ${userData?.planAccess[2] ? "shadow-yellow border-2 shadow-lg border-goldenYellow" : "shadow-lg "}  mt-4`}>
                    <CardContent className="p-4 sm:p-6 space-y-3 h-full flex justify-between flex-col">
                        <div>
                            <div>
                                <img src="/assets/icons/toolbox.svg" className="w-10 h-10" />
                            </div>
                            <div className="  flex justify-start items-center gap-2">
                                <p className="text-yellow font-bold text-2xl">Toolmate Pro</p>
                                {
                                    userData?.planAccess[2] && (
                                        <Badge variant="outline" className="px-4 py-1 border-yellow border-2 rounded-md bg-lightYellow text-black">
                                            currently Active
                                        </Badge>
                                    )
                                }
                            </div>

                        </div>
                        {/* upgrade */}
                        <div className={`${userData?.planAccess[2] ? "hidden" : "block w-full "}`}>
                            {
                                isPriceLoading ? <div className="flex gap-2 ">
                                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                                </div> : <AlertDialog
                                    onOpenChange={(isOpen) => {
                                        if (isCancelRequested || isSuspendRequested) {
                                            return;
                                        }
                                        setIsDowngradeOpen(isOpen);
                                    }}
                                    open={(isCancelRequested || isSuspendRequested) ? isDowngradeOpen : undefined}>
                                    <AlertDialogTrigger className="w-full">
                                        <div className="font-semibold w-full bg-gradient-to-r from-yellow to-softYellow  text-black rounded-md shadow-md py-2 hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 ease-in-out transform hover:scale-105">
                                            Upgrade
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <ul>
                                                    <li>You Will Be Changeded For Prorated Amount for this billing cycle And General Price for Next billing cycle</li>
                                                    <li>Update will take effect immediately.</li>
                                                    <li>All Your Current Data Will Be Same.</li>
                                                    <li>Update Might Take Several Moment to Complete Please Try To Refresh the Page To check.</li>
                                                    <li>after this billing cycle over,Your subscription will be converted from <b>Toolmate Essential</b> To <b>Toolmate Pro</b> </li>
                                                </ul>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction

                                                className="bg-blue-400 hover:bg-blue-600"
                                            >
                                                {
                                                    isRequestSubscriptionPauseLoading ?
                                                        <div className="animate-spin">
                                                            <LoaderCircle />
                                                        </div> : "Confirm Upgrade"
                                                }
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }



                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="my-6 bg-slate-100 p-4 rounded-lg">
                <div className="flex gap-2 items-center text-lg font-semibold">
                    <FolderKanban />
                    <p>Manage Subscription</p>
                </div>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">

                    <div className="bg-slate-200 p-4 rounded-md">
                        <div className="flex gap-2 items-start ">
                            <Ban width={35} height={35} />
                            <div className="flex flex-col items-start justify-start">
                                <p className="font-semibold ">Suspend Subscription</p>
                                <p className="text-slate-600 text-left">Temporarily Stop/Suspend The Subscription And Resume Later </p>
                            </div>
                        </div>
                        <div>
                            <AlertDialog
                                onOpenChange={(isOpen) => {
                                    if (isSuspendRequested || isRequestSubscriptionPauseLoading || isCancelRequested) {
                                        return;
                                    }
                                    setIsSuspendOpen(isOpen);
                                }}
                                open={!isSuspendRequested || !isCancelRequested ? isSuspendOpen : undefined}>
                                <AlertDialogTrigger className={`hover:bg-red-300 transition-all w-full px-4 py-2 rounded-md mt-3 border-2 border-red-300 text-red-500 ${isSuspendRequested || isCancelRequested ? "bg-red-300 cursor-default" : ""}`}>
                                    {
                                        isSuspendRequested && !isRequestSubscriptionPauseLoading && !isSuspendLoading ? <div >Suspend Already Requested</div> : <div>{
                                            isCancelRequested ? "Suspend not allowed: Active plan will be cancelled first." : "suspend your subscription"
                                        }</div>
                                    }

                                    {
                                        isRequestSubscriptionPauseLoading && isSuspendLoading && (
                                            <div className=" w-full h-fit flex gap-2 items-center justify-center">
                                                <LoaderCircle className="animate-spin" />
                                                <p>Loading....</p>
                                            </div>
                                        )
                                    }
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>How suspending the subscription works</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <ul>
                                                <li>No refund will be initiated as you have already been charged for the service.</li>
                                                <li>You can continue using the service until the next billing cycle.</li>
                                                <li>You will not be charged for next billing cycle</li>
                                                <li>The suspension will take effect at the start of the next billing cycle, not immediately.</li>
                                                <li>You can resume the subscription at any time after the suspension date.</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => {
                                                setIsSuspendLoading(true)
                                                await requestSubscriptionPause(false, "suspend", 0)
                                                setIsSuspendOpen(false)
                                                setIsSuspendLoading(false)
                                            }}
                                            className="bg-red-400 hover:bg-red-600">
                                            Confirm Suspend
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>


                    <div className="bg-slate-200 p-4 rounded-md flex justify-between flex-col">
                        <div className="flex gap-2 items-start ">
                            <Hand width={25} height={25} />
                            <div className="flex flex-col items-start justify-start">
                                <p className="font-semibold ">Cancel Subscription</p>
                                <p className="text-slate-600 text-left">Permanently Cancel The Subscription</p>
                            </div>
                        </div>
                        <div>

                            {/* cancel */}
                            <AlertDialog
                                onOpenChange={(isOpen) => {
                                    if (isCancelRequested || isRequestSubscriptionPauseLoading || isSuspendRequested) {
                                        return;
                                    }
                                    setIsCancelOpen(isOpen);
                                }}
                                open={!isCancelRequested || !isSuspendRequested ? isCancelOpen : undefined}
                            >
                                <AlertDialogTrigger className={`hover:bg-red-300 transition-all w-full px-4 py-2 rounded-md mt-3 border-2 border-red-300 text-red-500 ${isCancelRequested || isSuspendRequested ? "bg-red-300 cursor-default" : ""}`}>
                                    <div className="text-center">
                                        {isSuspendRequested && !isRequestSubscriptionPauseLoading ? (
                                            <div>Cancellation not allowed: Active plan will be suspended first.</div>
                                        ) : isCancelRequested ? (
                                            <div>Cancellation is already in progress.</div>
                                        ) : (
                                            <div> cancel your subscription.</div>
                                        )}

                                        {
                                            (isRequestSubscriptionPauseLoading && !isSuspendLoading) && (
                                                <div className=" w-full h-fit flex gap-2 items-center justify-center">
                                                    <LoaderCircle className="animate-spin" />
                                                    <p>Loading....</p>
                                                </div>
                                            )
                                        }

                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>How cancelling the subscription works</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <ul>
                                                <li>Your cancellation will take effect at the end of the current billing cycle.</li>
                                                <li>You will retain access to premium features until the subscription period ends.</li>
                                                <li>No prorated refunds will be provided for the remaining portion of the billing cycle.</li>
                                                <li>You can cancel via your account dashboard or by emailing support.</li>
                                                <li>Full refunds are available only within 7 days of initial purchase if no premium features were used.</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => requestSubscriptionPause(false, "cancel", 0)}
                                            className="bg-red-400 hover:bg-red-600">
                                            Confirm Cancel
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {
                        isSuspended && <div className="bg-slate-200 p-4 rounded-md flex flex-col justify-between">
                            <div className="flex gap-2 items-start ">
                                <TicketSlash width={25} height={25} />
                                <div className="flex flex-col items-start justify-start">
                                    <p className="font-semibold ">Resume Subscription</p>
                                    <p className="text-slate-600 text-left">Resume The Suspended Subscription</p>
                                </div>
                            </div>
                            <div>
                                {/* resume */}
                                <AlertDialog
                                    onOpenChange={(isOpen) => {
                                        if (isRequestSubscriptionPauseLoading) {
                                            return;
                                        }
                                        setIsResumeOpen(isOpen);
                                    }}
                                    open={isSuspended ? isResumeOpen : undefined}
                                >
                                    <AlertDialogTrigger className="hover:bg-green-300 transition-all w-full px-4 py-2 rounded-md mt-3 border-2 border-green-300 text-green-500">Resume Subscription</AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>How resuming the subscription works</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <ul>
                                                    <li>Your subscription will be resumed immediately.</li>
                                                    <li>You will be charged for the next billing cycle as per the subscription plan.</li>
                                                    <li>All features and benefits of the subscription will be restored when next billing cycle begins.</li>
                                                </ul>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-green-400 hover:bg-green-600">Confirm Resume</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    }

                    {
                        isSuspendRequested && <div className="bg-slate-200 p-4 rounded-md flex flex-col justify-between">
                            <div className="flex gap-2 items-start ">
                                <OctagonX width={35} height={35} />
                                <div className="flex flex-col items-start justify-start">
                                    <p className="font-semibold ">Cancel Suspend Request</p>
                                    <p className="text-slate-600 text-left">Suspend Request will not take effect and removed from the queue</p>
                                </div>
                            </div>
                            <div>
                                <AlertDialog
                                    onOpenChange={(isOpen) => {
                                        if (isRequestSubscriptionPauseLoading) {
                                            return;
                                        }
                                        setIsCancelSuspendOpen(isOpen);
                                    }}
                                    open={isSuspendRequested ? isCancelSuspendOpen : undefined}
                                >
                                    <AlertDialogTrigger className="hover:bg-purple-300 transition-all w-full px-4 py-2 rounded-md mt-3 border-2 border-purple-300 text-purple-500">
                                        {isCancelSuspendLoading ?
                                            <div className="flex gap-2 items-center justify-center">
                                                <LoaderCircle className="animate-spin" />
                                                <p>Loading....</p>
                                            </div>
                                            : "Cancel Suspend Request"}
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>How resuming the subscription works</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <ul>
                                                    <li>Your subscription will be resumed immediately.</li>
                                                    <li>You will be charged for the next billing cycle as per the subscription plan.</li>
                                                    <li>All features and benefits of the subscription will be restored when next billing cycle begins.</li>
                                                </ul>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={async () => {
                                                    setIsCancelSuspendOpen(false)
                                                    await handleRemovePauseSubscription("suspend")
                                                }}
                                                className="bg-purple-400 hover:bg-purple-600">Confirm To Cancel Subscription Suspend Request</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    }

                </div>
            </div>

        </div>;
    }

    function RefundLogs() {
        return <div>
            <div className="flex flex-col gap-2 items-center">
                {/* icons */}
                {
                    isRefundFailed && <div className="flex flex-col gap-2 items-start p-4 border-2 border-red-600 rounded-lg w-full">
                        <div className="flex gap-2 items-center">
                            <XCircle width={25} height={25} className="text-red-500" />
                            <p className="font-semibold text-red-500">Refund Request Failed</p>

                        </div>
                        <p>{refundRequestError}</p>
                    </div>
                }
                {
                    isRefundElibileStatusLoading ? (
                        <Skeleton className="w-full h-20 bg-slate-300" />
                    ) : isRefundEligible ? (
                        <div className="flex justify-between gap-2 items-center p-4 border-2 border-green-200  w-full rounded-md">
                            <div className="flex gap-2">
                                <CheckCircle width={25} height={25} className="text-green-300" />
                                <p className="font-semibold text-green-300">Refund Eligible</p>
                            </div>
                            <div>
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <button className="border-2 border-slate-200 hover:bg-slate-200 rounded-md px-6 py-2 text-slate-500">
                                            {
                                                isRefundRequestLoading ? <div className="flex gap-2 items-center justify-center">
                                                    <LoaderCircle className="animate-spin" />
                                                    <p>Please Wait...</p>
                                                </div> : "Request Refund"
                                            }
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <div className="font-semibold">
                                            <p className="font-semibold text-xl text-left my-4">Refund Request</p>
                                            <ul className="text-left">
                                                <li>Refund will be initiated for the current billing cycle.</li>
                                                <li>After initiating the refund, platform access will be changed immediately. And You will no longer be able to use the platform</li>
                                                <li>The refund amount will be processed to the original payment method.</li>
                                                <li>The refund will be processed within 7-10 business days.</li>
                                                <li>Once initiated, the refund request cannot be reverted.</li>
                                            </ul>

                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-softYellow hover:bg-lightYellow">Close</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={async () => {
                                                    if (!isRefundEligible) {
                                                        return;
                                                    }
                                                    await getRefunfRequest();
                                                }}
                                                className="border-slate-300 border-2 text-black hover:bg-slate-300 bg-slate-200">Agree And Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>


                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full gap-2 flex-col items-start p-4 border-2 border-red-600 rounded-lg ">
                            <div className="flex items-center gap-2 ">
                                <XCircle className="text-red-500" width={25} height={25} />
                                <p className="font-semibold text-red-500">Refund Not Eligible</p>
                            </div>
                            <p className="font-semibold capitalize">{nonEligibleReason}</p>
                        </div>
                    )
                }

            </div>

            <div className="flex gap-2 flex-col">
                {
                    (!(refundLogs.length > 0) && !(isNoRefundLogs)) && (
                        <div
                            onClick={async () => {
                                if (isRefundLogsLoading) {
                                    return;
                                }
                                await getRefundLogs();
                            }}
                            className="w-full cursor-pointer place-items-center bg-whiteYellow border-2 my-4 py-2 border-softYellow rounded-md">
                            {
                                isRefundLogsLoading ? (
                                    <div className="flex gap-2">
                                        <LoaderCircle className="animate-spin" />
                                        <p>Loading Refund Logs...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-semibold ">Show Refund Logs</p>
                                    </div>
                                )

                            }

                        </div>
                    )
                }
                {
                    isRefundLogsLoading ? (
                        <Skeleton className="w-full h-20 bg-slate-300" />
                    ) : <div>
                        <RefundLogsTable refundLogs={refundLogs} />
                    </div>
                }
            </div>
        </div>;
    }

    if (error) {
        return <div className="flex justify-center items-center text-red-700 font-semibold max-w-3xl">{error}</div>
    }
    return (
        <div className="">
            {/* nav bar */}
            <div className="bg-mangoYellow p-2 w-full flex justify-between">
                <div className="w-fit">
                    <Logo />
                </div>
                <div className="bg-whiteYellow border-2 border-yellow rounded-full md:hidden block">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-1">
                            <img src="/assets/line2.svg" className="" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuSeparator />
                            {tabs.map(tab => (
                                <DropdownMenuItem key={tab.id} onClick={() => setActiveTab(tab.id)}>
                                    {tab.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="p-5 flex gap-2">
                <div className="md:flex block md:gap-10 gap-4 w-full h-full ">
                    <div className="md:flex hidden w-fit gap-2 mt-8 flex-col h-fit transition-all">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`${activeTab === tab.id && "bg-paleYellow border-yellow"} transition-all border-r-4 rounded-l-md border-transparent items-center flex px-4 py-2 font-semibold cursor-pointer`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="ml-2">{tab.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="md:w-[calc(100%-350px)] h-full">
                        {activeTab === "details" && <PlanInfoTab />}
                        {activeTab === "logs" && <PaymentLogs />}
                        {activeTab === "curr" && <SubscriptionDetails />}
                        {activeTab === "refund" && <RefundLogs />}
                    </div>
                </div>
            </div>
        </div>
    );
}
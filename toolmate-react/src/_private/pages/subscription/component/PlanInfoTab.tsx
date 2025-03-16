import MateyExpression from "@/components/custom/MateyExpression";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/context/SubscriptionDetailsContext";
import { ArrowDownToLine, Ban, CalendarDays, ChevronDown, ChevronRight, CreditCard, Diamond, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionLogTable } from "@/components/custom/tables/tables/TransactionLogTable";
export default function PlanInfoTab() {
    const [isShowCycleDetails, setIsShowCycleDetails] = useState(false);
    const [isInfoPanalOpen, setIsInfoPanalOpen] = useState(false);
    const [panalFlag, setPanalFlag] = useState<"suspend" | "cancel" | "downgrade">("suspend");

    const {
        isLoading,
        subscriptionData,
        paymentLogs,
        isSuspendRequested,
        isCancelRequested,
        isProPlanSubscribed,
        isSuspended,
        transactionLogs
    } = useSubscription();
    console.log(subscriptionData, "subscriptionData");
    // panel flags setter 
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
            } else if (lastLog.status === "Down Grade processed! changes take effect accordingly") {
                setIsInfoPanalOpen(true);
                setPanalFlag("downgrade");
            }
        }
    }, [paymentLogs, isSuspendRequested, isCancelRequested, isProPlanSubscribed, isSuspended]);



    // ----------------- TSX Boundary -----------------
    if (isLoading || !subscriptionData) {
        return (
            <div className="w-full p-4 m-4 text-center h-full flex flex-col border-2 border-slate-200 text-slate-600 rounded-md items-center justify-center">
                <LoaderCircle className="animate-spin" />
                <span className="ml-2">Loading Subscription Details...</span>
            </div>
        );
    }

    if (!subscriptionData && !isLoading) {
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

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6">
            {isInfoPanalOpen && (
                <Card
                    className={`w-full p-4 m-4 ${panalFlag === "suspend" ? "bg-lighterYellow border-yellow" : panalFlag === "cancel" ? "bg-red-50 border-red-500" : "bg-blue-50 border-blue-500"} border-2`}
                >
                    {panalFlag === "suspend" && (
                        <div>
                            <div className="flex gap-4 items-center">
                                <TriangleAlert width={30} height={30} />
                                <div className="flex flex-col justify-start items-start">
                                    <p className="font-semibold text-lg">Suspend Requested</p>
                                    <p>Your Suspend request will take effect at the end of this billing cycle</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger className="flex flex-col justify-start px-4 py-1 my-4 border-2 border-yellow rounded-md font-semibold bg-softYellow hover:bg-lightYellow">
                                        How It Works ?
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>How Suspension Of Subscription Works!</AlertDialogTitle>
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
                                            <AlertDialogCancel className="font-semibold bg-softYellow hover:bg-paleYellow">Got It</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <div className="border-yellow border-2 rounded-md bg-mangoYellow hover:bg-softYellow cursor-pointer px-4 py-1 my-4">
                                    Manage Subscription
                                </div>
                            </div>
                        </div>
                    )}
                    {panalFlag === "cancel" && (
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
                                        <AlertDialogCancel className="font-semibold bg-red-50 hover:bg-red-100">Got It</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    {panalFlag === "downgrade" && (
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
                                        <AlertDialogCancel className="font-semibold bg-blue-50 hover:bg-blue-100">Got It</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </Card>
            )}

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
                        <InfoItem icon={<CreditCard className="w-5 h-5" />} label="Subscription ID" value={subscriptionData.subscriptionId} />
                        <InfoItem icon={<CreditCard className="w-5 h-5" />} label="Price Paid" value={String(subscriptionData.pricePaid)} />
                        <InfoItem icon={<CalendarDays className="w-5 h-5" />} label="Next Billing Cycle" value={new Date(subscriptionData.nextBillingCycle).toLocaleString()} />
                        <InfoItem icon={<CalendarDays className="w-5 h-5" />} label="Plan Started On" value={new Date(subscriptionData.planStartedOn).toLocaleString()} />
                        <InfoItem icon={<CalendarDays className="w-5 h-5" />} label="Last Paid On" value={new Date(subscriptionData.lastPaidOn).toLocaleString()} />
                        <div className="w-fit h-full flex gap-2">
                            <InfoItem icon={<Diamond className="w-5 h-5" />} label="Plan Status" value={subscriptionData.planStatus} />
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

            <div className="flex flex-col w-full gap-2">
                <div className="flex justify-between items-center bg-slate-200 p-4 rounded-md">
                    <h2 className="text-xl font-semibold text-slate-800">Transaction Logs</h2>

                </div>
                <TransactionLogTable transactionLogs={transactionLogs} />

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

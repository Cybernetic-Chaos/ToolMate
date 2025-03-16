import { useContext, useEffect, useState } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { UserContext } from "@/context/userContext";
import { RefundLogsTable } from "@/components/custom/tables/tables/Refund-log-table";

export default function RefundLogs({
    activeTab
}: {
    activeTab: string;
}) {
    const [isRefundRequestLoading, setRefundRequestLoading] = useState(false);
    const [isRefundSuccess, setIsRefundSuccess] = useState(false);
    const [isRefundElibileStatusLoading, setIsRefundElibileStatusLoading] = useState(false);
    const [isRefundEligible, setIsRefundEligible] = useState(false);
    const [isRefundFailed, setIsRefundFailed] = useState(false);
    const [nonEligibleReason, setNonEligibleReason] = useState("");
    const [refundLogs, setRefundLogs] = useState([]);
    const [isRefundLogsLoading, setIsRefundLogsLoading] = useState(false);
    const [isNoRefundLogs, setIsNoRefundLogs] = useState(false);
    const [refundRequestError, setRefundRequestError] = useState("");

    const { userData } = useContext(UserContext);
    const { toast } = useToast();



    // get refund logs function
    async function getRefundLogs() {
        setIsRefundLogsLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getRefundLogs`, {
                userId: userData?.id
            });
            if (!res || res.data.logs.length === 0) {
                setIsNoRefundLogs(true);
                toast({
                    title: "Error",
                    description: "No Refund Logs Found",
                    variant: "destructive"
                });
            } else {
                setRefundLogs(res.data.logs);
            }
        } catch (error: any) {
            toast({
                title: "Error Occurred",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsRefundLogsLoading(false);
        }
    }

    // refund request
    async function getRefundRequest() {
        setRefundRequestLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/refundRequest`, {
                userId: userData?.id
            });
            if (res.data.success) {
                setIsRefundSuccess(true);
                toast({
                    title: "Success",
                    description: "Refund Request Sent Successfully",
                    variant: "success"
                });
            } else {
                setIsRefundFailed(true);
                setRefundRequestError(res.data.message);
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            setIsRefundFailed(true);
            setRefundRequestError(error.message);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setRefundRequestLoading(false);
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
                });
                console.log(data);
                setIsRefundEligible(data.isEligible);
                if (!data || !data.isEligible) {
                    setNonEligibleReason(data.message);
                }
            } catch (error: any) {
                toast({
                    title: "Error Occurred",
                    description: error.message,
                    variant: "destructive"
                });
            } finally {
                setIsRefundElibileStatusLoading(false);
            }
        }
    }, [userData]);



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
                isRefundSuccess && <div className="flex flex-col gap-2 items-start p-4 border-2 border-green-200 rounded-lg w-full">
                    <div className="flex gap-2 items-center">
                        <CheckCircle width={25} height={25} className="text-green-300" />
                        <p className="font-semibold text-green-300">Refund Request Sent Successfully</p>
                    </div>
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
                                                await getRefundRequest();
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
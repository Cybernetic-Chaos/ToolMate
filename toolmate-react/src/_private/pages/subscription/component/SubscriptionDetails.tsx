import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { LoaderCircle } from "lucide-react"
import { FolderKanban, Ban, Hand, TicketSlash, OctagonX } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useContext, useState } from "react"
import { UserContext } from "@/context/userContext"
import { useSubscription } from "@/context/SubscriptionDetailsContext"
import { usePriceContext } from "@/context/pricingContext"
import React from "react"
export default function SubscriptionDetails() {
    const [isDowngradeOpen, setIsDowngradeOpen] = useState(false); // downgrade subscription request
    const [isSuspendOpen, setIsSuspendOpen] = useState(false); // suspend subscription request
    const [isCancelOpen, setIsCancelOpen] = useState(false); // cancel subscription request
    const [isSuspendLoading, setIsSuspendLoading] = useState(false);
    const [isResumeOpen, setIsResumeOpen] = useState(false); // resume subscription request
    const [isCancelSuspendOpen, setIsCancelSuspendOpen] = useState(false); // cancel suspend request


    const {
        requestSubscriptionPause,
        isRequestSubscriptionPauseLoading,
        isSuspended,
        isSuspendRequested,
        isCancelRequested,
        isCancelSuspendLoading,
        handleRemovePauseSubscription
    } = useSubscription();
    const {
        isPriceLoading,
    } = usePriceContext();
    const { userData } = useContext(UserContext)


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
                                    if (isRequestSubscriptionPauseLoading) {
                                        return;
                                    }
                                    if (isCancelRequested || isSuspendRequested) {
                                        return;
                                    }
                                    setIsDowngradeOpen(isOpen);
                                }}
                                open={(isCancelRequested || isSuspendRequested) ? isDowngradeOpen : undefined}>
                                <AlertDialogTrigger className="w-full">
                                    <div className="font-semibold w-full bg-slate-200 rounded-md shadow-md py-2 hover:bg-slate-300">
                                        {
                                            isRequestSubscriptionPauseLoading ? <div className="flex justify-center items-center">
                                                <LoaderCircle className="animate-spin" />
                                            </div> : "Downgrade"
                                        }
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
                                    isRequestSubscriptionPauseLoading && isSuspendLoading ? (
                                        <div className=" w-full h-fit flex gap-2 items-center justify-center">
                                            <LoaderCircle className="animate-spin" />
                                            <p>Loading....</p>
                                        </div>
                                    ) : isSuspendRequested ? (
                                        <div>Suspend Already Requested</div>
                                    ) : isCancelRequested ? (
                                        <div>Suspend not allowed: Active plan will be cancelled first.</div>
                                    ) : (
                                        <div>suspend your subscription</div>
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
                                    {isRequestSubscriptionPauseLoading ? (
                                        <div className=" w-full h-fit flex gap-2 items-center justify-center">
                                            <LoaderCircle className="animate-spin" />
                                            <p>Loading....</p>
                                        </div>
                                    ) : isSuspendRequested ? (
                                        <div>Cancellation not allowed: Active plan will be suspended first.</div>
                                    ) : isCancelRequested ? (
                                        <div>Cancellation is already in progress.</div>
                                    ) : (
                                        <div>Cancel Your Subscription.</div>
                                    )}
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
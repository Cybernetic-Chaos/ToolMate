import Logo from "@/components/custom/Logo";
import { BadgeCheck, CreditCard, Logs, RefreshCw } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PlanInfoTab from "./component/PlanInfoTab";
import { useSubscription } from "@/context/SubscriptionDetailsContext";
import { UserContext } from "@/context/userContext";
import PaymentLogs from "./component/PaymentLogs";
import SubscriptionDetails from "./component/SubscriptionDetails";
import RefundLogs from "./component/RefundLogs";

const tabs = [
    { id: "details", label: "Plan Information", icon: CreditCard },
    { id: "curr", label: "Subscription Management", icon: BadgeCheck },
    { id: "logs", label: "Activity", icon: Logs },
    { id: "refund", label: "Refund Management", icon: RefreshCw },
];
export default function SubscriptionLayout() {
    const [activeTab, setActiveTab] = useState("details");
    const {
        fetchSubscriptionDetails,
        fetchPaymentLogs,
    } = useSubscription();
    const { userData } = useContext(UserContext);

    // ************************************************************
    // USEEFFECT
    // ************************************************************

    // Fetch subscription details and payment logs
    useEffect(() => {
        if (userData && userData.activePlan) {
            fetchSubscriptionDetails(userData.activePlan as string);
        }
        if (userData && userData.id) {
            fetchPaymentLogs(userData.id);

        }
    }, [userData]);


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
                        {activeTab === "refund" && <RefundLogs activeTab={activeTab} />}
                    </div>
                </div>
            </div>
        </div>
    )
}
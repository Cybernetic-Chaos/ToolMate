import { UserContext } from "@/context/userContext"
import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import MateyExpression from "./MateyExpression"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info, LoaderCircle } from "lucide-react"
import { toast, useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function OverDue() {
    const {userData, isOverdue, setIsOverdue } = useContext(UserContext)
    const [isOverdueStatusLoading, setIsOverdueStatusLoading] = useState<boolean>(false)
    const [isOverdueStatusError, setIsOverdueStatusError] = useState<boolean>(false)
    const { toast } = useToast();
    const navigate = useNavigate();
    async function refreshOverDueStatus() {
        setIsOverdueStatusLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/revokeOverDuePlan`,{
                userId:userData?.id
            });
            console.log(res,"dfsjdofksd")
            if (res.status !== 200 || !res.data.success) {
                toast({
                    title: res.data.message,
                    description: "Please try again",
                    variant: "destructive",
                })
            }
            if (res.data.route == '/dashboard') {
                setIsOverdue(false)
                navigate('/dashboard')
            }
        } catch (error: any) {
            toast({
                title: "Failed to refresh status",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsOverdueStatusLoading(false)
        }
    }


    return (
        <div className="bg-gradient-to-b to-whiteYellow from-white h-screen w-screen">
            <section className="flex flex-col items-center justify-center h-fit mt-56">
                <div className="border-2 border-slate-300 px-4 py-2 rounded-md">
                    <div className="flex items-center justify-between">
                        <MateyExpression expression="tool" />
                        <div className="flex flex-col text-left">
                            <p className="text-xl font-semibold">Your Plan Is Overdue</p>
                            <p className="capitalize">Please complete the transaction for this billing cycle to continue using our services.</p>
                        </div>
                    </div>
                    <div className=" bg-slate-100 border-2 border-slate-400 rounded-md m-2">
                        <div className="flex flex-col md:flex-row items-center px-4 py-3 gap-2 text-black font-semibold">

                            <Link to="/" className="w-full md:flex-1 px-4 py-2 border-2 border-softYellow rounded-md bg-paleYellow hover:bg-yellow font-semibold text-center">Home</Link>
                            <Link to="/manage-subscription" className="w-full md:flex-1 px-4 py-2 border-2 border-softYellow rounded-md bg-paleYellow hover:bg-yellow font-semibold text-center">Manage Subscription </Link>
                        </div>
                        <div className="w-full ">
                            <button
                            onClick={async ()=>{
                                if(isOverdueStatusLoading) return;
                                await refreshOverDueStatus()
                            }}
                            className="bg-lightYellow  hover:bg-softYellow w-full font-semibold px-4 py-2 rounded-b-md flex gap-2 items-center justify-center">
                                {
                                    isOverdueStatusLoading ? <div className="flex gap-2">
                                        <LoaderCircle className="animate-spin"/>
                                        <p>Loading Status...</p>
                                    </div> :
                                        <div className="flex items-center gap-2">
                                            Is Paid ? Refresh Overdue Status
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info width={20} height={20} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Click here if you have completed the payment to refresh your status and regain access to your account.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                }


                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}
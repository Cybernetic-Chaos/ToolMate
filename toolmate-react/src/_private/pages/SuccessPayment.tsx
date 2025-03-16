import Confetti from 'react-confetti';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, CreditCard, LoaderCircle } from 'lucide-react';
import MateyExpression from '@/components/custom/MateyExpression';
import axios from 'axios';
import { UserContext } from '@/context/userContext';
import { useToast } from '@/hooks/use-toast';

export default function SuccessPayment() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();
    const { toast } = useToast();

    // State management
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [baToken, setBaToken] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [planData, setPlanData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false); // To prevent multiple requests

    // Update dimensions for Confetti on window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Extract query parameters on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setBaToken(queryParams.get('ba_token'));
        setSubscriptionId(queryParams.get('subscription_id'));
    }, []);

    // Fetch plan data and confirm subscription
    useEffect(() => {
        // Prevent unnecessary API calls
        if (!baToken || !subscriptionId || !userData || requestSent) {
            return;
        }

        const data = JSON.parse(localStorage.getItem('paypalData') || '{}');
        if (data?.ba === baToken) {
            setPlanData(data);
        } else {
            console.error("BA token mismatch or missing paypalData in localStorage");
        }
    }, [baToken, subscriptionId, userData, requestSent]);

    useEffect(() => {
        async function confirmSubscription() {
            if (!planData) {
                console.error("Plan data is missing");
                return;
            }

            setIsLoading(true);
            try {
                const apiData = {
                    subscriptionId: subscriptionId,
                    planName: planData.Packname,
                    ba: baToken,
                    userId: userData?.id,
                };

                console.log("API Data being sent:", apiData);

                const res = await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/paymentConfirmationAndUpdate`,
                    apiData
                );

                if (res.status === 200) {
                    console.log("Subscription confirmed successfully:", res.data);
                    localStorage.removeItem('paypalData');
                    setRequestSent(true); // Mark the request as sent
                    toast({
                        title: "Success",
                        description: "Your subscription has been confirmed successfully.",
                        variant: "default",
                    });
                } else {
                    throw new Error(res.data.message || "Unexpected error occurred");
                }
            } catch (error: any) {
                console.error("Error confirming subscription:", error.message);
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (planData && !requestSent) {
            confirmSubscription();
        }
    }, [planData, baToken, subscriptionId, userData, requestSent]);

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-t from-softYellow  via-paleYellow to-paleYellow">
            <Confetti
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
            />

            <div className="flex shadow-lg from-accent-foreground w-full h-full items-center justify-center">
                <div className="shadow-md p-4 rounded-lg border border-slate-400 bg-gradient-to-tr from-paleYellow to-mangoYellow">
                    <div className="flex gap-2 items-center">
                        <MateyExpression expression="2thumb" />
                        <div className="flex flex-col gap-3 items-start leading-4">
                            <p className="font-semibold text-xl">Plan Subscription Successfully</p>
                            <p className="text-slate-500">Payment Completed</p>
                        </div>
                    </div>

                    {planData && (
                        <div className="border-t-2 border-slate-700 my-4">
                            <div className="flex flex-col gap-2 mt-4 items-start font-semibold text-xl">
                                <p className='text-lg'>Subscribed To: {planData.Packname}</p>
                                <p className="text-slate-600 font-medium">Price: {planData.price}</p>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex gap-2 items-center">
                            <LoaderCircle />
                            <p>Please Wait</p>
                        </div>
                    )}

                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex justify-center items-center mt-4 gap-2 bg-yellow px-4 py-2 rounded-md font-semibold hover:bg-lightYellow cursor-pointer shadow-md transition-transform transform hover:scale-105"
                    >
                        <CircleCheck size={22} />
                        Go To Dashboard
                    </div>
                    <div
                        onClick={() => navigate('/manage-subscription')}
                        className="flex justify-center items-center mt-2 gap-2 bg-yellow/40 px-4 py-2 rounded-md font-semibold hover:bg-lightYellow cursor-pointer shadow-md transition-transform transform hover:scale-105"
                    >
                        <CreditCard size={22} />
                        Manage Subscription
                    </div>
                </div>
            </div>
        </div>
    );
}

import MateyExpression from "@/components/custom/MateyExpression";

import { useContext, useEffect, useState } from "react";
import { Anvil, CalendarDays, CreditCard, DotIcon, LoaderPinwheel, Package2, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/userContext";
import { ChatItem } from "@/types/types";
import { UserButton } from "@clerk/clerk-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import axios from "axios";

export default function Dashboard() {
    // const { isLoaded, isSignedIn, user } = useUser();
    const [mainInput, setMainInput] = useState("");
    const [stateOfButton, setStateOfButton] = useState(-1);
    const { retrieveCache, historyData, userData } = useContext(UserContext);
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [error, setError] = useState("");
    const [cache, setCache] = useState<ChatItem[]>([]);
    const [isTooltipLoading, setIsTooltipLoading] = useState(false);
    const [toolTipMessage, setToolTipMessage] = useState("");
    const [isNewTooltip, setIsNewTooltip] = useState(false);
    const [isTooltipAlreadyGiven, setIsTooltipAlreadyGiven] = useState(false);
    const navigate = useNavigate();
    console.log(location, "location")
    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log("Got location:", latitude, longitude);
                        setLocation({ latitude, longitude });
                        localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        setError("Unable to retrieve your location");
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
            }
        };

        const storedLocation = localStorage.getItem("userLocation");
        if (storedLocation) {
            const parsedLocation = JSON.parse(storedLocation);
            console.log("Retrieved location from storage:", parsedLocation);
            setLocation(parsedLocation);
        } else {
            getLocation();
        }
    }, []);
    useEffect(() => {
        const lastTooltipDate = localStorage.getItem("lastTooltipDate");
        const currentDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

        // Compare directly as strings
        if (lastTooltipDate === currentDate) {
            console.log("Hit: Tooltip already given today");
            setIsTooltipAlreadyGiven(true);
            setToolTipMessage(localStorage.getItem("toolTipMessage") || "");
        } else {
            console.log("Miss: Fetching new tooltip");
            handleGetTooltip();
        }
    }, []);

    async function handleGetTooltip() {
        if (isTooltipAlreadyGiven) return; // Skip if already fetched for today

        setIsTooltipLoading(true);

        try {
            const url = `${import.meta.env.VITE_SERVER_URL}/api/v1/getTooltip`;
            const response = await axios.post(url, { userId: userData?.id });

            if (response.data.success) {
                const tooltip = response.data.tooltip;
                setToolTipMessage(tooltip);
                localStorage.setItem("toolTipMessage", tooltip);
                localStorage.setItem("lastTooltipDate", new Date().toISOString().split("T")[0]); // Save only date
                setIsTooltipAlreadyGiven(true);
                setIsNewTooltip(true);
            }
        } catch (error) {
            console.error("Error fetching tooltip:", error);
        } finally {
            setIsTooltipLoading(false);
        }
    }

    useEffect(() => {
        if (historyData) {
            const cacher: ChatItem[] = retrieveCache()
            setCache(cacher)
            console.log(cacher, "cacheData")
        }
    }, [historyData])
    async function handleUserPrompt() {
        console.log(mainInput, "is here")
        localStorage.setItem("userPrompt", mainInput);
        navigate("/c");
    }
    return (
        <div className="w-full h-full md:mt-0  mt-16 ">
            <div className="absolute top-2 right-2">
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action
                            label="Manage Your Subscription"
                            labelIcon={<CreditCard width={15} />}
                            onClick={() => navigate('/manage-subscription')}
                        />
                    </UserButton.MenuItems>
                </UserButton>
            </div>
            {/* <div className="flex justify-center items-center w-full p-10">
          <TradingVolumeSlider/>
          </div> */}
            {/* top section  */}
            <div
                className="w-full min-h-[50vh] bg-cover bg-center p-4 md:px-14 py-10 gap-0 flex flex-col justify-start"
                style={{ backgroundImage: "url('/assets/images/dashBG.jpg')" }}
            >
                {/* content */}

                <p className="flex gap-2 items-center md:block mb-2 text-left font-bold text-3xl md:-mb-4 bg-gradient-to-r from-orange to-lightOrange bg-clip-text text-transparent">
                    Hello There!
                    <div className="block md:hidden w-12 h-12">
                        <MateyExpression expression="tool" />

                    </div>
                </p>

                <div className="flex items-center gap-2 md:-mb-2">
                    <p className="text-left text-2xl font-black">Ask Matey About Your Latest DIY Plan!</p>
                    <div className="hidden md:block">
                        <MateyExpression expression="tool" />

                    </div>
                </div>

                <p className="text-left text-md text-slate-600 font-semibold">Share your DIY project ideas with Matey for expert advice!</p>


                {/* section */}

                {/* input */}

                <div className="mt-6 flex md:flex-row flex-col md:w-fit w-full gap-2">
                    <div
                        onClick={() => navigate("/my-inventory")}
                        className="w-full md:w-fit flex text-white font-semibold bg-gradient-to-r rounded-sm hover:from-orange/80  hover:to-lightOrange/80 cursor-pointer from-orange to-lightOrange p-2 px-4 gap-3">
                        <Package2 className="text-white" />
                        <p>Your Tool Inventory </p>
                    </div>
                    <Dialog onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setIsNewTooltip(false);
                        }
                    }}>
                        <DialogTrigger>
                            <div className="relative overflow-ellipsis  md:m-0 mr-2">
                                <div
                                    onClick={handleGetTooltip}
                                    className="w-full md:w-fit flex text-white font-semibold bg-gradient-to-r rounded-sm hover:from-lightOrange/80  hover:to-orange/80 cursor-pointer from-lightOrange to-orange p-2 px-4 gap-3 ">
                                    <CalendarDays className="text-white" />
                                    <p>Tooltip Of the Day </p>
                                </div>
                                {
                                    !isTooltipAlreadyGiven && isNewTooltip && <div className="px-1 py-0.5 w-4 h-5 bg-gradient-to-l from-orange to-lighterYellow min-w-5 rounded-full text-center text-white text-xs absolute -top-2 -end-1 translate-x-1/4 text-nowrap">
                                        <div className="absolute top-0 start-0 rounded-full -z-10 animate-ping bg-orange w-full h-full"></div>
                                    </div>
                                }

                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    <div className="flex gap-2 items-center">
                                        <MateyExpression expression="offer" />
                                        <p className="font-semibold text-xl capitalize">Tooltip of the Day by matey </p>
                                    </div>
                                </DialogTitle>
                                <DialogDescription>
                                    {
                                        isTooltipAlreadyGiven && (
                                            <div className="font-semibold text-black border-orange border-2 bg-lightOrange  my-3 rounded-md p-2">
                                                <p className="capitalize">Here's your tip of the day from Matey! Don't forget to check back tomorrow for another tip.</p>


                                            </div>
                                        )
                                    }
                                    <div className="border-2 border-lightOrange p-4 rounded-md">



                                        {
                                            isTooltipLoading ? (
                                                <div className="flex justify-center items-center gap-2">
                                                    <LoaderPinwheel className="animate-spin" />
                                                    <p>Remembering Tooltip...</p>
                                                </div>
                                            ) : (
                                                <p>{toolTipMessage}</p>
                                            )
                                        }
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>


                </div>
                <div className="w-full max-w-6xl flex gap-0 border-2 bg-white border-lightOrange mt-2 rounded-lg flex-col">
                    <textarea
                        value={mainInput}
                        onChange={(e) => setMainInput(e.target.value)}
                        placeholder="Give Your Idea To Matey."
                        className="w-full rounded-t-lg rounded-b-none pr-12 outline-none focus:outline-none focus:ring-0 placeholder-slate-900 text-slate-900 transition-all duration-1000 ease-in-out"
                        rows={3}
                        style={{ transition: "height 0.3s ease-in-out" }}
                    />
                    <div className="p-2 h-12 border-t-2 border-lightOrange justify-between items-center w-full flex space-x-2">
                        <div className="flex gap-4 items-center">

                            <button
                                onClick={handleUserPrompt}
                                disabled={stateOfButton === 0 ? true : false}
                                className="bg-orange rounded-md p-2 hover:bg-lightOrange hover:shadow-md hover:shadow-light"
                            >
                                {stateOfButton === -1 ? (
                                    <Send size={18} />
                                ) : stateOfButton === 0 ? (
                                    <LoaderPinwheel className="animate-spin" />
                                ) : (
                                    <div className="w-1 h-1 bg-slate-500 rounded-sm"></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>


                {/* pick where you have left     */}

                {cache.length !== 0 &&
                    <div className="my-5 flex flex-col gap-3">
                        <h1>
                            <span className="text-orange"> Ready </span>
                            to Dive Back In?
                        </h1>

                        {/* card */}
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-1 items-center min-w-min">
                                {cache.slice(0, 5).map((item: ChatItem, index) => (
                                    <Link to={`/matey/${item.sessionId}`} key={index} className="h-60 bg-gradient-to-tr from-slate-100 to-slate-300 hover:to-softYellow hover:from-white hover:border-yellow transition-all duration-300 ease-in-out cursor-pointer md:max-w-52 min-w-[200px] md:w-1/6 justify-between flex flex-col p-2 text-left rounded-md border-2 border-slate-300">
                                        <Anvil color="#ff6600" />
                                        <p className="text-slate-700 max-h-[70%] overflow-hidden">
                                            {typeof item.chatName === 'string' && item.chatName.length > 130 ? `${item.chatName.slice(0, 130)}...` : item.chatName}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                }
            </div>
        </div>
    );
}

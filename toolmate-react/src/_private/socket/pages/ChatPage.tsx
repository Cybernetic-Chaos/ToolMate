import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Aichat from "@/components/custom/Aichat";
import MateyExpression from "@/components/custom/MateyExpression";
import { useSocket } from "@/context/socketContext";
import { UserContext } from "@/context/userContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ArrowDownToDot, ExpandIcon, Send, LoaderPinwheel, CircleDashed, CircleStop, Box, BadgeDollarSign, Lock } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { IMateyExpression, ProductItem } from "@/types/types";
import { RightSidebarContext } from "@/context/rightSidebarContext";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@radix-ui/react-separator";
import { useUser } from "@clerk/clerk-react";
import FullMateyExpression from "@/components/custom/FullMateyExpression";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"


import CustomSlider from "@/components/custom/Slider";
import { Button } from "@/components/ui/button";
import ProductDialog from "@/components/custom/ProductDialog";

interface Message {
    role: string;
    message: string;
    workQueue?: string[];
    productData?: ProductItem[];
    bunningsData?: any;
    mateyProduct?: any;
    isProductSuggested?: boolean;
    isCommunitySuggested?: boolean;
    communityId?: any[];
    productSuggestionList?: any[];
    isMateyProduct?: boolean;
    isBunningsProduct?: boolean;
    productId?: any[];
}
interface ChatHistorySuccessResponse {
    success: true;
    data: any;
    ai: any[];
    matey: any[];
    bunnings: any[];
}

interface ChatHistoryErrorResponse {
    success: false;
    message: string;
}

type ChatHistoryResponse = ChatHistorySuccessResponse | ChatHistoryErrorResponse;

async function fetchChatHistory(
    sessionId: string | undefined,
    userId: string | undefined,
    pagination: { page: number, limit: number }
): Promise<ChatHistoryResponse> {
    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getChatConversationHistory`, {
            sessionId,
            userId,
            pagination,
        });
        console.log("response", response.data.data)
        const aiProduct: any[] = [];
        const mateyProduct: any[] = [];
        const bunningsProduct: any[] = [];

        response.data.data.forEach((chatItem: any) => {

            console.log("chatItem", chatItem.mateyProduct, chatItem.bunningsProductList, chatItem.productData, [chatItem.isMateyProduct, chatItem.isBunningsProduct, chatItem.isProductSuggested])
            if (chatItem.isMateyProduct && chatItem.mateyProduct) {
                aiProduct.push(...chatItem.mateyProduct);
            }
            if (chatItem.isBunningsProduct && chatItem.bunningsProductList) {
                bunningsProduct.push(...chatItem.bunningsProductList);
            }
            if (chatItem.isProductSuggested && chatItem.productData) {
                mateyProduct.push(...chatItem.productData);
            }
        });
        console.log("bunningsProduct", bunningsProduct, response.data.data)
        const modifiedData = response.data.data.map((item: any) => {
            if (item.bunningsProductList) {
                item.bunningsData = item.bunningsProductList;
                delete item.bunningsProductList;
            }
            return item;
        });

        return {
            success: true,
            data: modifiedData,
            ai: aiProduct,
            matey: mateyProduct,
            bunnings: bunningsProduct,
        };
    } catch (error) {
        console.error("Error fetching chat history", error);
        return { success: false, message: "Can't Load Your Chat History" };
    }
}


async function fetchCurrentMateyMemoryStatus(sessionId: string | undefined) {
    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getChatMemoryStatus`, {
            sessionId,
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Error fetching chat memory status", error);
        return { success: false, message: "Can't Load Your Chat Memory Status" };
    }

}
export function ChatPage() {
    const { user } = useUser();

    const { sessionId } = useParams<{ sessionId: string }>();
    const socket = useSocket();
    const { userId, userData, unshiftiChatname } = useContext(UserContext);
    const {
        isBudgetChangable,
        clearAllTool,
        setBreakpoints,
        sliderValue,
        breakpoints,
        massAddAi,
        massAddBunnings,
        massAddVendor,
        appendAi,
        appendBunnings,
        appendVendor,
        aiProduct,
        bunningProduct,
        vendorProduct,
        setIsBudgetChangable,
        setIsBudgetOn,
        isBudgetOn
    } = useContext(RightSidebarContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const isNew = Boolean(searchParams.get("new"));
    const { toast } = useToast();

    const [conversation, setConversation] = useState<Message[]>([]);
    const [currStreamingRes, setCurrStreamingRes] = useState("");
    const [isNotificationOn, setIsNotificationOn] = useState(false);
    const [notificationText, setNotificationText] = useState("Matey is Adding...");
    const [mainInput, setMainInput] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [mateyExpression, setMateyExpression] = useState("smile");
    const [stateOfButton, setStateOfButton] = useState(-1);
    const pagination = useRef({ page: 1, limit: 10 }).current;
    const isLoadingMore = useRef(false).current;
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isMateyMemory, setIsMateyMemory] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [currLoadingProductFeature, setCurrLoadingProductFeature] = useState<number[]>([]);
    const [isMateyOpen, setIsMateyOpen] = useState(false);
    const [currActiveTab, setCurrActiveTab] = useState("bunnings");

    const [currActiveCategory, setCurrActiveCategory] = useState<string>("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const handleScroll = () => { };
    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
            return () => chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, [isLoadingMore, hasMore, pagination]);

    console.log(currActiveCategory, currActiveTab)

    useEffect(() => {
        async function fetchHistory() {
            const isFetchAllowed = localStorage.getItem('retrieveChat') === "yes";
            if (!isNew && isFetchAllowed) {
                setIsLoadingHistory(true);
                const chatData = await fetchChatHistory(sessionId, userData?.id, pagination);
                const memoryData = await fetchCurrentMateyMemoryStatus(sessionId);

                if (!memoryData.success) {
                    toast({
                        title: "Error",
                        description: memoryData.message,
                        variant: "destructive",
                    });
                    setIsError(true);
                } else {
                    setIsMateyMemory(memoryData.data.isMateyMemoryOn);
                }

                if (!chatData.success) {
                    toast({
                        title: "Error",
                        description: chatData.message || "Can't Load Your Chat History",
                        variant: "destructive",
                    });
                    setIsError(true);
                } else {
                    console.log("chatData", chatData)
                    massAddAi(chatData.ai);
                    massAddBunnings(chatData.bunnings);
                    massAddVendor(chatData.matey);
                    setConversation(chatData.data);
                    setHasMore(chatData.data.length === pagination.limit);
                }
                setIsLoadingHistory(false);
            }
        }

        fetchHistory();

        return () => {
            clearAllTool();
        };
    }, [sessionId]);

    useEffect(() => {
        if (sessionId) {
            const budgetSlider = localStorage.getItem(`budgetSlider-${sessionId}`);
            if (budgetSlider) {
                setBreakpoints(JSON.parse(budgetSlider));
            }
        }
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSocketEvents = () => {
        const handleMessage = (data: { text: string }) => {
            setCurrStreamingRes((prev) => prev + data.text);
        };

        const handleEmoMessage = (data: { text: string, isContinue: boolean }) => {
            if (data.isContinue) {
                setConversation((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], message: prev[prev.length - 1].message + data.text }]);
            } else {
                setConversation((prev) => [...prev, { role: "ai", message: data.text }]);
            }
        };

        const handleChatName = (data: any) => {
            unshiftiChatname({ chatName: data.chatName, sessionId: data.sessionId, id: data.id });
        };

        const handleStatus = (data: any) => {
            setIsNotificationOn(true);
            setNotificationText(data.message);
        };

        const handleStatusOver = () => {
            setIsNotificationOn(false);
            setNotificationText("");
        };

        const handleBudgetSlider = (data: any) => {
            localStorage.setItem(`budgetSlider-${sessionId}`, JSON.stringify(data));
            setBreakpoints(data);
        };

        const handleIntendList = (data: number[]) => {
            const workerQueue = data.map((item) => {
                switch (item) {
                    case 2: return "Suggested community support";
                    case 3: return "Recommended useful products";
                    case 4: return "Asked clarifying questions";
                    case 5: return "Provided project guidance as needed";
                }
            });
            setConversation((prev: any) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "ai") {
                    return [...prev.slice(0, -1), { ...lastMessage, workQueue: workerQueue }];
                }
                return [...prev, { role: "ai", message: "", workQueue: workerQueue }];
            });
        };

        const handleProductId = async (data: { categoryName: string; products: string[] }[]) => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/getProductFromId`, data);
                if (response.status === 200) {
                    const productData = response.data.data;
                    console.log(productData, "is product data from chat page")
                    appendVendor(productData);
                    setConversation((prev) => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage.role === "ai") {
                            return [...prev.slice(0, -1), { ...lastMessage, productData: productData as unknown as ProductItem[] }];
                        }
                        return [...prev, { role: "ai", message: "", productData: productData as unknown as ProductItem[] }];
                    });
                    setCurrLoadingProductFeature((prev) => prev.filter((item) => item !== 2));

                }
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };

        const handleMateyProducts = async (data: any) => {
            appendAi(data);
            setCurrLoadingProductFeature((prev) => prev.filter((item) => item !== 3));
            setConversation((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "ai") {
                    return [...prev.slice(0, -1), { ...lastMessage, mateyProduct: data }];
                }
                return prev;
            });
        };

        const handleNoProduct = (data: { message: string }) => {
            setNotificationText(data.message);
        };

        const handleBunningProduct = (data: any) => {
            console.log("bunningProduct", data)
            appendBunnings(data);
            setCurrLoadingProductFeature([]);
            setConversation((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "ai") {
                    return [...prev.slice(0, -1), { ...lastMessage, bunningsData: data }];
                }
                return prev;
            });
        };

        const handleError = (data: any) => {
            toast({
                title: "Error",
                description: data.message,
                variant: "destructive",
            });
        };

        const handleProductIdLoading = (data: []) => {
            setCurrLoadingProductFeature(data);
        };

        socket?.on("message", handleMessage);
        socket?.on("chatName", handleChatName);
        socket?.on("status", handleStatus);
        socket?.on("statusOver", handleStatusOver);
        socket?.on("budgetSlider", handleBudgetSlider);
        socket?.on("intendList", handleIntendList);
        socket?.on("productId", handleProductId);
        socket?.on("noProduct", handleNoProduct);
        socket?.on("emoMessage", handleEmoMessage);
        socket?.on('bunningsProduct', handleBunningProduct);
        socket?.on("productList", handleProductIdLoading);
        socket?.on("aiProducts", handleMateyProducts);
        socket?.on("mateyExpression", (ex: string) => setMateyExpression(ex || "laugh"));
        socket?.on("terminate", () => {
            setStateOfButton(-1);
            setCurrStreamingRes("");
        });
        socket?.on("error", handleError);

        return () => {
            socket?.off("message", handleMessage);
            socket?.off("chatName", handleChatName);
            socket?.off("status", handleStatus);
            socket?.off("statusOver", handleStatusOver);
            socket?.off("budgetSlider", handleBudgetSlider);
            socket?.off("intendList", handleIntendList);
            socket?.off("productId", handleProductId);
            socket?.off("noProduct", handleNoProduct);
            socket?.off("emoMessage", handleEmoMessage);
            socket?.off('bunningsProduct', handleBunningProduct);
            socket?.off("error", handleError);
            socket?.off("aiProducts", handleMateyProducts);
        };
    };

    useEffect(() => {
        async function fetchHistory() {
            const isFetchAllowed = localStorage.getItem('retrieveChat') === "yes";
            if (!isNew && isFetchAllowed) {
                setIsLoadingHistory(true);
                const chatData = await fetchChatHistory(sessionId, userData?.id, pagination);
                const memoryData = await fetchCurrentMateyMemoryStatus(sessionId);
                if (!memoryData.success) {
                    toast({
                        title: "Error",
                        description: memoryData.message,
                        variant: "destructive",
                    });
                    setIsError(true);
                } else {
                    setIsMateyMemory(memoryData.data.isMateyMemoryOn);
                }
                if (!chatData.success) {
                    toast({
                        title: "Error",
                        description: chatData.message,
                        variant: "destructive",
                    });
                    setIsError(true);
                } else {
                    setConversation(chatData.data);
                }
                setIsLoadingHistory(false);
            }
        }
        fetchHistory();
    }, [sessionId]);

    useEffect(() => {
        appendToChat(false, false);
    }, [currStreamingRes]);

    function appendToChat(isSecondServerMessage: boolean, isSecondContinue: boolean) {
        if (isSecondContinue) {
            setConversation((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], message: currStreamingRes }]);
            return;
        }
        if (isSecondServerMessage) {
            setConversation((prev) => [...prev, { role: "ai", message: currStreamingRes }]);
            return;
        }
        if (currStreamingRes) {
            setConversation((prev) =>
                prev[prev.length - 1]?.role === "ai"
                    ? [...prev.slice(0, -1), { ...prev[prev.length - 1], message: currStreamingRes }]
                    : [...prev, { role: "ai", message: currStreamingRes }]
            );
        }
    }

    useEffect(() => {
        if (isNew) {
            setStateOfButton(1);
            const initialMessage = localStorage.getItem('userPrompt') || "Hey Matey!";
            setConversation((prev) => [...prev, { role: "user", message: initialMessage }]);

            if (socket && userData) {
                socket.emit("getChatName", { prompt: initialMessage, sessionId, userId: userData?.id });
                socket.emit("userMessage", { sessionId, message: initialMessage, userId });
            }
            searchParams.delete("new");
            setSearchParams(searchParams);
            localStorage.removeItem('userPrompt');
        }

        const cleanup = handleSocketEvents();

        return () => {
            cleanup();
            localStorage.setItem('retrieveChat', "yes");
            setBreakpoints([]);
        };
    }, [socket, isNew, userData, sessionId, searchParams, setSearchParams]);

    useEffect(scrollToBottom, [conversation]);

    const handleUserPrompt = () => {
        if (mainInput === "" || stateOfButton === 0) return;
        setStateOfButton(0);
        setNotificationText("Matey is Thinking...");
        setIsNotificationOn(true);
        setConversation([...conversation, { role: "user", message: mainInput }]);
        const userMessage = userData?.planAccess[2]
            ? {
                sessionId,
                message: mainInput,
                userId,
                isBudgetSliderPresent: breakpoints.length > 0,
                budgetSliderValue: sliderValue,
                isBudgetSliderChangable: isBudgetChangable,
            }
            : { sessionId, message: mainInput, userId };
        socket?.emit("userMessage", userMessage);
        setMainInput("");
    };

    const handleMateyMemory = async () => {
        setIsMateyMemory((prev) => !prev);
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/changeMemoryStatus`, {
            userStatus: !isMateyMemory,
            sessionId,
        });

        if (res.status === 200) {
            toast({
                title: "Success",
                description: res.data.message,
                variant: "success",
            });
        }
    };

    const handleMessageStop = async () => {
        setStateOfButton(1);
        socket?.emit("stop", { sessionId });
    };
    useEffect(() => {
        console.log(conversation.length)
    }, [conversation])
    if (isLoadingHistory && !isNew) {
        return (
            <div className="flex justify-center items-center w-full h-screen">
                <div className="flex flex-col items-center justify-center gap-4">
                    <MateyExpression expression="tool" />
                    <p className="text-lg text-center font-semibold capitalize">
                        Matey is Recalling your chat...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center w-full h-screen">
                <MateyExpression expression="thinking" />
                <p className="text-lg text-center font-semibold capitalize">
                    Error Occurred While Fetching Chat History
                </p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col md:w-auto  w-screen  h-screen py-4 md:pl-4 px-2 ${conversation.length === 1 ? "items-end" : "items-center"}`}>
            <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-scroll max-w-4xl flex flex-col gap-4 pr-4 relative w-full md:mt-0 mt-14"
            >
                {isLoadingMore && (
                    <div className="flex justify-center py-4">
                        <LoaderPinwheel className="animate-spin text-orange" />
                    </div>
                )}
                {conversation.map((data, index) => (
                    <div key={index}>
                        {data.role === "ai" ? (
                            <Aichat
                                id={String(index)}
                                message={data.message.replace("Typing...", "")}
                                productData={data.productData}
                                bunningsData={data.bunningsData}
                                aiData={data.mateyProduct}
                                isBunningLoading={conversation.length == index + 1 && currLoadingProductFeature.includes(1)}
                                isProductLoading={conversation.length == index + 1 && currLoadingProductFeature.includes(2)}
                                isAiProductLoading={conversation.length == index + 1 && currLoadingProductFeature.includes(3)}
                            />
                        ) : (
                            <div className="w-full">

                                <div className="w-full flex justify-start  rounded-md items-center">
                                    <hr className="h-1 border-2 border-slate-300 " />
                                    <div className="flex gap-4 w-full items-start rounded-md px-1 py-2 ">
                                        <div className="min-w-8 min-h-8">
                                            {
                                                (!user?.hasImage) ?
                                                    <Avatar>
                                                        <AvatarFallback>A</AvatarFallback>
                                                    </Avatar>
                                                    : <img
                                                        className="w-8 h-8 rounded-full"
                                                        src={user?.imageUrl}
                                                    />
                                            }
                                        </div>
                                        <div className="px-2 font-medium text-left">
                                            {data.message}
                                        </div>
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="border border-slate-300 w-full mt-4" />
                            </div>
                        )}

                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>
            <div className="w-full flex gap-2">
                <div className={`${isMateyOpen ? "w-[85%]" : "w-full"} flex flex-col items-center`}>
                    {isNotificationOn && (
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-start w-full max-w-4xl gap-2 text-orange"
                        >
                            <CircleDashed className="animate-spin" />
                            <p className="animate-pulse font-semibold">{notificationText}</p>
                        </motion.div>
                    )}
                    <div className="min-w-full w-full bg-slate-100 border-2 border-lightOrange rounded-lg mt-2 flex flex-col">
                        <textarea
                            value={mainInput}
                            onChange={(e) => setMainInput(e.target.value)}
                            placeholder="Give Your Idea To Matey."
                            className="w-full bg-slate-50 rounded-t-lg pr-12 placeholder-slate-900 text-slate-900 outline-none focus:ring-0"
                            rows={isExpanded ? 9 : 3}
                            style={{ transition: "height 0.3s ease-in-out" }}
                        />
                        <div className="flex justify-between items-center p-2 border-t-2 border-lightOrange h-14">
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger onClick={() => setIsMateyOpen(!isMateyOpen)} className="md:block hidden">
                                        <MateyExpression expression={mateyExpression as IMateyExpression} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isMateyOpen ? "Close" : "Open"} Matey Section</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="block  md:hidden">

                                <MateyExpression expression={mateyExpression as IMateyExpression} />
                            </div>

                            <div className="flex gap-2 items-center">
                                <TooltipProvider>
                                    <Tooltip delayDuration={10}>
                                        <TooltipTrigger className="">
                                            <Drawer>
                                                <DrawerTrigger className="p-2 rounded-xl bg-orange/40 md:hidden block">
                                                    <BadgeDollarSign className="text-white" />
                                                </DrawerTrigger>
                                                <DrawerContent className="p-4 h-[calc(100%-10rem)]">
                                                    {
                                                        userData?.planAccess[2] ? <div className="flex gap-2 flex-col">
                                                            <CustomSlider />
                                                            <hr className="border-2 border-yellow" />
                                                            <div className="p-4 flex gap-2 flex-col">
                                                                <div className="flex gap-3">
                                                                    <Switch
                                                                        checked={isBudgetOn}
                                                                        onChange={() => setIsBudgetOn(!isBudgetOn)}
                                                                    />
                                                                    <p>Apply Budget Slider</p>
                                                                </div>

                                                                <div className="flex gap-3">
                                                                    <Switch
                                                                        checked={isBudgetChangable}
                                                                        onChange={() => setIsBudgetChangable(!isBudgetChangable)}
                                                                    />
                                                                    <p>Change Budget Slider</p>
                                                                </div>

                                                            </div>
                                                        </div> : <div className="flex flex-col items-center justify-center p-4 bg-paleYellow rounded-md mt-5 gap-5">
                                                            <Lock />
                                                            <p>Access Only In Pro Plan</p>
                                                            <Button>Upgrade</Button>
                                                        </div>
                                                    }
                                                </DrawerContent>
                                            </Drawer>


                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Budget Slider</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip delayDuration={10}>
                                        <TooltipTrigger className="">

                                            <div
                                                onClick={() => {
                                                    setCurrActiveTab("bunnings")
                                                    setCurrActiveCategory(bunningProduct[0]?.categoryName)
                                                    setIsProductDialogOpen(true)
                                                }}
                                                className="p-2 rounded-xl bg-orange/40 md:hidden block">
                                                <Box className="text-white" />
                                            </div>

                                            {
                                                isProductDialogOpen && <ProductDialog
                                                    isOpen={isProductDialogOpen}
                                                    setIsOpen={setIsProductDialogOpen}
                                                    bunningsProduct={bunningProduct}
                                                    vendorProduct={vendorProduct}
                                                    mateyMadeProduct={aiProduct}
                                                />
                                            }



                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Product Suggestion</p>
                                        </TooltipContent>
                                    </Tooltip>

                                </TooltipProvider>


                                <Separator orientation="vertical" className="border border-lightOrange w-full h-10 md:hidden block" />
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Switch
                                                checked={isMateyMemory}
                                                onCheckedChange={() => handleMateyMemory()}
                                                defaultChecked={true}
                                                className="data-[state=checked]:bg-lightOrange data-[state=unchecked]:bg-slate-400"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent className="border-2 border-orange shadow-lg">
                                            <div className="flex flex-col gap-2">
                                                <p className="font-semibold text-lightOrange text-left">Add to Matey Memory - {isMateyMemory ? "On" : "Off"}</p>
                                                <Separator orientation="vertical" className="border border-lightOrange w-full" />
                                                <div className="max-w-sm text-left flex flex-col gap-2">
                                                    <p className="font-semibold">
                                                        When On, Matey will remember this conversation to give better suggestions in future chats.
                                                    </p>
                                                    <p>{isMateyMemory ? "Turn Off if you don't want Matey to remember this chat" : "Turn On if you do want Matey to remember this chat"}</p>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip delayDuration={10}>
                                        <TooltipTrigger className="">
                                            <ArrowDownToDot className="cursor-pointer hover:text-orange text-slate-600" onClick={scrollToBottom} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Scroll To Bottom</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                    <Tooltip delayDuration={10} >
                                        <TooltipTrigger className="md:flex hidden">
                                            <ExpandIcon
                                                className="md:flex hidden cursor-pointer text-slate-600 hover:text-orange"
                                                onClick={() => setIsExpanded((prev) => !prev)}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Expand Text Area</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <button
                                    onClick={handleUserPrompt}
                                    disabled={stateOfButton === 0}
                                    className={`bg-orange p-2 ${mainInput.length == 0 ? "bg-orange/50 hover:bg-orange/50 cursor-not-allowed" : ""} hover:bg-orange/80 rounded-xl shadow-md text-white hover:shadow-xl`}                            >
                                    {stateOfButton === 0 ? (
                                        <div onClick={handleMessageStop}>
                                            <CircleStop />
                                        </div>
                                    ) : (
                                        <Send />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    isMateyOpen &&
                    <div className="bg-yellow w-[15%] mt-2 rounded-md flex justify-center items-center" style={{ backgroundImage: 'url(/assets/images/matey-bg.png)', backgroundSize: 'cover' }}>
                        <FullMateyExpression expression={mateyExpression as IMateyExpression} />
                    </div>
                }
            </div>
        </div>
    );
}



import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { LoaderPinwheel, TableOfContents, Timer, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MateyExpression from "./MateyExpression";

interface Product {
    name: string;
    price: number;
    assets: string;
}

interface ChatMessage {
    message: string;
    role: "user" | "ai";
    expression?: "laugh" | "hello" | "smile" | "offer" | "1thumb" | "2thumb" | "tool" | "thinking"
    isToolSuggestion?: boolean;
    products?: Product[];
    followUpQuestion?: boolean;
    budgetSlider?: boolean;
    budgetRange?: { min: number; max: number };
    isEnd?: boolean;
}

const chatDemo: ChatMessage[] = [
    { message: "What's the best tool to hang a picture frame?", role: "user" },
    {
        message: "For picture frames, a cordless drill and self-drilling wall anchors are a great combo for secure mounting. 😊",
        role: "ai",
        expression: "tool",
        isToolSuggestion: true,
        products: [
            { name: "Cordless Drill", price: 50, assets: "/assets/images/demo/product2.png" },
            { name: "Self-Drill Wall Anchors", price: 15, assets: "/assets/images/demo/product3.png" }
        ]
    },
    {
        message: "By the way, do you have a budget in mind? I can keep suggestions within your range.",
        role: "ai",
        expression: "thinking",
        budgetSlider: true,
        budgetRange: { min: 10, max: 200 }
    },
    { message: "Let's keep it under $80.", role: "user" },
    {
        message: "Perfect! Here's a selection under $80 that'll work well for your frames. Let me know if you need more ideas!",
        role: "ai",
        expression: "offer",
        isToolSuggestion: true,
        products: [
            { name: "Basic Hanging Kit", price: 18, assets: "/assets/images/demo/product1.png" },
            { name: "Compact Cordless Drill", price: 40, assets: "/assets/images/demo/product3.png" }
        ]
    },
    { message: "Thanks, any tips for avoiding extra holes?", role: "user" },
    {
        message: "Sure! Try using painter's tape to plan your layout first. This way, you can visualize before drilling. 😊",
        role: "ai",
        expression: "smile"
    },
    {
        message: "Grab some tape and a pencil, and let's get those frames up! Let me know if you're ready to start!",
        role: "ai",
        expression: "2thumb",
        isEnd: true
    }
];

export function MobileMock() {
    const [currChat, setCurrChat] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const [isProcessing, setIsProcessing] = useState(false); // Flag to control flow
    const navigate = useNavigate();
    const scrollToBottomSmoothly = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };
    const processChat = async (index: number) => {
        if (index >= chatDemo.length) return;

        const currentMessage = chatDemo[index];
        setIsProcessing(true);

        if (currentMessage.role === "ai") {
            setIsStreaming(true);
            setStreamingText(""); // Reset the streaming text first
            let charIndex = 0;
            const message = currentMessage.message;
            while (charIndex < message.length) {
                setStreamingText(message.substring(0, charIndex + 1)); // Use substring instead
                charIndex++;
                await new Promise((resolve) => setTimeout(resolve, 30));
            }
            setCurrChat((prev) => [...prev, { ...currentMessage, message: currentMessage.message }]);
            setStreamingText("");
            setIsStreaming(false);
        } else {
            setCurrChat((prev) => [...prev, currentMessage]);
        }

        scrollToBottomSmoothly();

        setTimeout(() => {
            setIsProcessing(false);
            processChat(index + 1);
        }, 2000);
    };

    useEffect(() => {
        if (!isProcessing) {
            processChat(currChat.length); // Start from the current chat length
        }
    }, [isProcessing]);

    useEffect(() => {
        scrollToBottomSmoothly();
    }, [currChat]);

    return (
        <div className="w-full h-full flex md:flex-row flex-col justify-center it md:justify-start items-center mb-5 relative">
            <div className="hidden md:flex">
                <img src="/assets/matey/langingMatey.svg" alt="back" className="z-0 top-0 left-48 absolute rotate-12" />
            </div>

            <motion.div
                className="absolute hidden lg:flex bottom-28 z-20 -left-40  flex-col gap-4 justify-end items-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="flex justify-between gap-3 rounded-full w-fit p-4 h-fit bg-white/50 backdrop-blur-lg border-2 border-yellow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Wrench />
                    Tool Recommendations
                </motion.div>
                <motion.div
                    className="flex capitalize justify-between gap-3 rounded-full w-fit p-4 h-fit bg-white/70 backdrop-blur-xl border-2 border-yellow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <TableOfContents />
                    Step-by-Step Guides
                </motion.div>
                <motion.div
                    className="flex  capitalize justify-between gap-3 rounded-full w-fit p-4 h-fit bg-white/50 backdrop-blur-xl border-2 border-yellow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Timer />
                    Save Time on Projects
                </motion.div>
            </motion.div>

            <div className="block md:hidden w-full h-full">
                <img src="/assets/matey/langingMatey.svg" alt="back" className="w-96 h-96 -mb-40 -mt-10" />
            </div>
            <div className="md:w-[330px] md:h-[550px] w-[250px] h-[530px] md:mb-10 z-10 p-2 md:ml-28 rounded-3xl bg-gradient-to-t from-slate-300 to-softYellow ">
                <div ref={scrollAreaRef} className=" z-10  bg-white md:w-[315px] w-[235px] h-[515px] md:h-[535px] h mb-10 overflow-scroll hide-scrollbar  p-2 rounded-3xl ">
                    <div className="flex flex-col space-y-4 mt-3 mb-40 ">
                        {currChat.map((chat, index) => (
                            <div
                                key={index}
                                className={`rounded-lg ${chat.role === "ai" ? "text-left" : "text-right "}`}
                            >
                                <div className={`flex gap-2 w-full ${chat.role === "ai" ? "justify-start" : "justify-end"}`}>
                                    {chat.role === "ai" ? (
                                        <div className="flex gap-2 items-start">
                                            <div className="w-32 ">

                                                <MateyExpression expression={chat.expression} />
                                            </div>
                                            <p>{chat.message}</p>
                                        </div>
                                    ) : (
                                        <motion.p
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-1 bg-lightYellow rounded-lg w-fit  px-4 py-2  border-2  border-yellow "
                                        >
                                            {chat.message}
                                        </motion.p>
                                    )}
                                </div>
                                {chat.isToolSuggestion && (
                                    <motion.div
                                        className="mt-2 bg-paleYellow border-2 border-yellow rounded-lg p-2"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="flex gap-2 mb-2">
                                            <img src="/assets/icons/Tick.svg" alt="tick" className="w-5 h-5" />
                                            <p className="font-semibold">Material Suggestions</p>
                                        </div>
                                        <div className="flex gap-3">
                                            {chat.products?.map((product, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className="flex flex-col"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 1.2, delay: idx * 0.2 }}
                                                >
                                                    <img src={product.assets} alt={product.name} className="border-2 border-yellow rounded-lg" />
                                                    <p className="font-semibold text-darkYellow text-m">{product.name}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {chat.budgetSlider && (
                                    <motion.div
                                        className="mt-2 bg-paleYellow border-2 border-yellow rounded-lg p-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className="flex gap-2 mb-2">
                                            <img src="/assets/icons/Tick.svg" alt="tick" className="w-5 h-5" />
                                            <p className="font-semibold">Budget Selection</p>
                                        </div>
                                        <div className="flex gap-2 my-4">
                                            <p>Material Budget •</p>
                                            <p className="font-semibold">{chat.budgetRange?.min} - {chat.budgetRange?.max} AUD</p>
                                        </div>
                                        <Slider defaultValue={[50]} min={chat.budgetRange?.min} max={chat.budgetRange?.max} />
                                    </motion.div>
                                )}
                            </div>
                        ))}
                        {isStreaming && (
                            <div className="p-2 rounded-lg flex items-start gap-2 text-left">
                                {/* <img src="/assets/icons/blur-ball.svg" className="min-w-9" /> */}
                                <LoaderPinwheel className=" text-yellow animate-spin min-w-9 max-w-32 max-h-32" />
                                <p>{streamingText}</p>
                            </div>
                        )}
                    </div>

                    {/* CTA for 'isEnd' */}
                    <div className="relative">

                        {currChat.some(chat => chat.isEnd) && (
                            <div className="flex justify-center mt-4 w-full absolute bottom-14">
                                <motion.button
                                    onClick={() => navigate('/preview')}
                                    className="px-6 py-4 w-fit bg-yellow hover:bg-softYellow text-black rounded-lg font-semibold transition-all"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Start A Chat With Matey
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

export function getRandomExpression(): "laugh" | "hello" | "smile" | "offer" | "1thumb" | "2thumb" | "tool" | "thinking" {
    const expressions = ["laugh", "hello", "smile", "offer", "1thumb", "2thumb", "tool", "thinking"] as const;
    const randomIndex = Math.floor(Math.random() * expressions.length);
    return expressions[randomIndex];
}
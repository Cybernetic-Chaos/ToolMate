import Logo from "@/components/custom/Logo";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import MateyExpression from "../../components/custom/MateyExpression";
import { Columns2, LoaderPinwheel, Send } from "lucide-react";
import Aichat from "@/components/custom/Aichat";
import { ScrollArea } from "@/components/ui/scroll-area";
import io, { Socket } from "socket.io-client";
import { ExpressionData, IChat } from "@/types/types";
import classNames from "classnames";

let socket: Socket;

export default function PreviewChat() {
  const [mainInput, setMainInput] = useState("");
  const [stateOfButton, setStateOfButton] = useState(-1);
  const [currentMessage, setCurrentMessage] = useState<IChat[]>([]);
  const [mateyExpression, setMateyExpression] = useState("laugh");
  // for collapsable

  const [collapsed, setSidebarCollapsed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (socket) {
      socket.disconnect();
    }

    socket = io(import.meta.env.VITE_SOCKET_URL as string);

    // event Fire to create session

    const handleConnect = () => {
      console.log("Socket connected");
    };

    const handleAcknowledgement = (data: { sessionId: string }) => {
      localStorage.setItem("sessionId", data.sessionId);
    };

    const handleExpression = (data: ExpressionData) => {
      setCurrentMessage((prev) => {
        const updatedMessages = [...prev];
        updatedMessages.pop();
        updatedMessages.push({
          role: "ai",
          expression: data.kwargs.content,
          message: "Typing...",
        });
        return updatedMessages;
      });
      setMateyExpression(data.kwargs.content);
    };

    const handleMessage = (data: { text?: string; done?: boolean }) => {
      if (data.text) {
        setCurrentMessage((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = prev.length - 1;
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            message: prev[lastMessageIndex].message + data.text,
          };
          return updatedMessages;
        });
      }

      if (data.done) {
        setStateOfButton(-1);
        socket.disconnect();
      }
    };

    const handleTerminate = () => {
      setStateOfButton(-1);
    };

    // Event listeners
    socket.on("connect", handleConnect);
    socket.on("acknowledgement", handleAcknowledgement);
    socket.on("expression", handleExpression);
    socket.on("message", handleMessage);
    socket.on("terminate", handleTerminate);

    return () => {
      localStorage.removeItem("sessionId");
      socket.off("connect", handleConnect);
      socket.off("acknowledgement", handleAcknowledgement);
      socket.off("expression", handleExpression);
      socket.off("message", handleMessage);
      socket.off("terminate", handleTerminate);
      socket.disconnect();
    };
  }, []);
  // create new session on page load
  useEffect(() => {
    socket.emit("createSession", "create session");
  }, []);

  useEffect(() => {
    const handleInput = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(
          textarea.scrollHeight,
          5 * parseFloat(getComputedStyle(textarea).lineHeight)
        )}px`;
      }
    };

    handleInput(); // Adjust height on initial render
    if (textareaRef.current) {
      textareaRef.current.addEventListener("input", handleInput);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener("input", handleInput);
      }
    };
  }, []);

  function handleUserPrompt(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (mainInput === "") {
      return;
    }
    setStateOfButton(0);

    const prevMessages = [
      ...currentMessage,
      { role: "user", expression: "", message: mainInput },
      { role: "ai", expression: "tool", message: "Typing..." },
    ];
    setCurrentMessage(prevMessages);

    socket.emit("message", {
      prompt: mainInput,
      sessionId: localStorage.getItem("sessionId"),
    });

    setMainInput("");
  }

  // to remove the vertical scroll bar
  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0); // Scroll to top
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);
  return (
    <Tabs defaultValue="free" className="">
      <div className="w-full h-full">
        {/* Tab navigation for desktop */}
        <div className="hidden md:flex bg-white justify-between w-full items-center fixed top-0 left-0 right-0 z-50 px-6 py-4 border-r-2 border-slate-500">
          <Logo />
          <div>
            <TabsList className="bg-white border-2 border-slate-400">
              <TabsTrigger
                value="free"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/wrench.svg"
                  alt="free logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Toolmate Free</p>
              </TabsTrigger>
              <TabsTrigger
                value="essential"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/gear.svg"
                  alt="essential logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Toolmate Essential</p>
              </TabsTrigger>
              <TabsTrigger
                value="pro"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/toolbox.svg"
                  alt="pro logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Toolmate Premium</p>
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className={`${buttonVariants({
                variant: "secondary",
                size: "StretchedButton",
              })} font-semibold hover:bg-zinc-300`}
            >
              Home
            </Link>
            <Link
              to="/signup"
              className={`${buttonVariants({
                variant: "orangeGradient",
                size: "StretchedButton",
              })} font-semibold`}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Tab navigation for mobile */}
        <div className="flex md:hidden flex-col fixed top-0 left-0 right-0 z-50 bg-white">
          <div className="flex justify-between w-full items-center fixed top-15 left-0 right-0 z-50 py-4 px-1">
            <Logo />
            <div className="flex gap-2">
              <Link
                to="/"
                className={`${buttonVariants({
                  variant: "secondary",
                  size: "StretchedButton",
                })} font-semibold hover:bg-zinc-300 hidden sm:block`}
              >
                Home
              </Link>
              <Link
                to="/signup"
                className={`${buttonVariants({
                  variant: "orangeGradient",
                })} font-semibold`}
              >
                Sign Up
              </Link>
            </div>
          </div>
          <div className="mt-14 flex justify-center">
            <TabsList className="w-fit flex justify-center gap-4">
              <TabsTrigger
                value="free"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/wrench.svg"
                  alt="free logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Free</p>
              </TabsTrigger>
              <TabsTrigger
                value="essential"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/gear.svg"
                  alt="essential logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Essential</p>
              </TabsTrigger>
              <TabsTrigger
                value="pro"
                className="flex justify-center items-center gap-2"
              >
                <img
                  src="/assets/icons/toolbox.svg"
                  alt="pro logo"
                  width={15}
                  height={15}
                />
                <p className="text-black">Premium</p>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Core chatbot */}
        <div className="w-[1500px] px-5 mt-20 h-full">
          <TabsContent value="free">
            {/* <div className="w-full bg-white md:h-[690px] border-2 border-slate-400 flex shadow-amber-400 shadow-xl mt-16 items-stretch justify-center rounded-md overflow-hidden"> */}
            <div
              className={`${classNames({
                grid: true,
                "grid-cols-sidebar": !collapsed,
                "grid-cols-sidebar-collapsed": collapsed,
                "transition-[grid-template-columns] duration-300 ease-in-out":
                  true,
              })} w-full bg-white  md:max-h-[690px] border-2 border-slate-300 flex shadow-amber-400 shadow-xl mt-16 items-stretch  rounded-md overflow-hidden`}
            >
              {/* left side */}
              <div className=" bg-lightyellow-500">sdfs</div>
              {/* right side  (core) */}
              <div className=" bg-white  md:h-[690px] items-stretch justify-center rounded-md overflow-hidden">
                {/* <div className="w-1/4 h-full bg-slate-100 p-4 md:flex hidden ">
                <GetPremium />
              </div> */}

                <div className="w-full h-full ">
                  {/* collapse button */}
                  <div className="text-white w-full h-fit p-1  flex justify-start items-start">
                    <button
                      className="p-2 hover:bg-slate-300 rounded-md"
                      onClick={() => setSidebarCollapsed((prev) => !prev)}
                    >
                      <Columns2 className="w-5 h-5 text-black" />
                    </button>
                  </div>
                  <div className="flex flex-col h-full justify-between pb-14 mr-5">
                    <ScrollArea className="flex flex-col gap-2 w-full">
                      <div className="w-full flex flex-col gap-4 pr-5 mb-16 scrollable-content">
                        {currentMessage.length === 0 && (
                          <div>
                            <div className=" mt-10 ml-10 font-extrabold text-gray-700 text-4xl text-left capitalize   ">
                              <span className=" bg-gradient-to-r from-orange to-yellow-500bg-clip-text text-transparent">
                                Hello There !
                              </span>
                              How can we assist you with your tool needs today?
                            </div>
                          </div>
                        )}
                        {currentMessage.map((message: IChat, index) =>
                          message.role === "ai" ? (
                            <Aichat
                              key={index}
                              message={message.message.replace("Typing...", "")}
                            />
                          ) : (
                            <div
                              key={index}
                              className="flex w-full items-end justify-end gap-3"
                            >
                              <div className="bg-yellow-500border-slate-400 border-2 font-black capitalize px-6 py-2 rounded-md">
                                {message.message}
                              </div>
                            </div>
                          )
                        )}
                        <div></div>
                      </div>
                    </ScrollArea>
                    <div>
                      <div className="absolute bottom-24 flex items-center justify-center">
                        {/* <div
                        className="w-10 h-10 mx-3  bg-lightOrange rounded-full flex items-center justify-center border border-slate-600 hover:bg-orange transition-all cursor-pointer"
                        onClick={scrollToBottom}
                      >
                        <ArrowDown />
                      </div> */}
                      </div>
                      <div className="bg-white flex-grow">
                        <div className="flex h-fit items-end">
                          {/* expression */}
                          <div className="mx-2">
                            <MateyExpression expression={mateyExpression} />
                          </div>
                          <div className="flex items-center p-1 justify-between rounded-md border-2 border-slate-400 w-screen max-w-full">
                            <div className="flex items-center justify-center w-full mb-2">
                              <textarea
                                placeholder="Need Tool Advice? Start Typing..."
                                className="rounded-lg mt-2 w-full resize-none p-0 m-0 border-none outline-none bg-transparent text-black placeholder-black"
                                value={mainInput}
                                ref={textareaRef}
                                onChange={(e) => setMainInput(e.target.value)}
                                rows={1}
                              />
                            </div>
                            <button
                              onClick={handleUserPrompt}
                              className="bg-gradient-to-tr mb-1 from-orange to-lightOrange rounded-md p-2 hover:from-orange/80 hover:to-lightOrange/80"
                            >
                              {stateOfButton === -1 ? (
                                <Send size={22} />
                              ) : stateOfButton === 0 ? (
                                <LoaderPinwheel className="animate-spin" />
                              ) : (
                                <div className="w-1 h-1 bg-slate-500 rounded-sm "></div>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </div>
    </Tabs>

    //     <Tabs defaultValue="free" className="">
    //   <div className="w-full h-full">
    //     {/* Tab navigation for desktop */}
    //     <div className="hidden md:flex bg-white justify-between w-full items-center fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b-2 border-slate-500">
    //       <Logo />
    //       <div>
    //         <TabsList className="bg-white border-2 border-slate-400">
    //           <TabsTrigger value="free" className="flex justify-center items-center gap-2">
    //             <img src="/assets/icons/wrench.svg" alt="free logo" width={15} height={15} />
    //             <p className="text-black">Toolmate Free</p>
    //           </TabsTrigger>
    //           <TabsTrigger value="essential" className="flex justify-center items-center gap-2">
    //             <img src="/assets/icons/gear.svg" alt="essential logo" width={15} height={15} />
    //             <p className="text-black">Toolmate Essential</p>
    //           </TabsTrigger>
    //           <TabsTrigger value="pro" className="flex justify-center items-center gap-2">
    //             <img src="/assets/icons/toolbox.svg" alt="pro logo" width={15} height={15} />
    //             <p className="text-black">Toolmate Premium</p>
    //           </TabsTrigger>
    //         </TabsList>
    //       </div>
    //       <div className="flex gap-4">
    //         <Link to="/" className={`${buttonVariants({ variant: "secondary", size: "StretchedButton" })} font-semibold hover:bg-zinc-300`}>
    //           Home
    //         </Link>
    //         <Link to="/signup" className={`${buttonVariants({ variant: "orangeGradient", size: "StretchedButton" })} font-semibold`}>
    //           Sign Up
    //         </Link>
    //       </div>
    //     </div>

    //     {/* Core chatbot */}
    //     <div className="max-w-full px-5 mt-20 mx-auto h-full ">
    //       <TabsContent value="free">
    //         <div
    //           className={`${classNames({
    //             "grid": true,
    //             "grid-cols-sidebar": !collapsed,
    //             "grid-cols-sidebar-collapsed": collapsed,
    //             "transition-[grid-template-columns] duration-300 ease-in-out": true,
    //           })} w-[1400px] h-[640px] bg-white border-2 border-slate-400 shadow-amber-400 shadow-xl items-stretch rounded-md overflow-hidden`}
    //         >
    //           {/* left side */}
    //           <div className="bg-lightYellow">sdfs</div>

    //           {/* right side (core) */}
    //           <div className="bg-white h-full items-stretch justify-center rounded-md overflow-hidden">
    //             <div className="text-white w-fit h-fit overflow-hidden p-1">
    //               <button className="p-2 hover:bg-slate-300 rounded-md" onClick={() => setSidebarCollapsed((prev) => !prev)}>
    //                 <Columns2 className="w-5 h-5 text-black" />
    //               </button>
    //             </div>
    //             <div className="flex flex-col h-full justify-between pb-14 mr-5">
    //               <ScrollArea className="flex flex-col gap-2 w-full">
    //                 <div className="w-full flex flex-col gap-4 pr-5 mb-16 scrollable-content">
    //                   {currentMessage.length === 0 && (
    //                     <div>
    //                       <div className="mt-10 ml-10 font-extrabold text-gray-700 text-4xl text-left capitalize">
    //                         <span className="bg-gradient-to-r from-orange to-yellow-500bg-clip-text text-transparent">
    //                           Hello There!{" "}
    //                         </span>
    //                         How can we assist you with your tool needs today?
    //                       </div>
    //                     </div>
    //                   )}
    //                   {currentMessage.map((message, index) =>
    //                     message.role === "ai" ? (
    //                       <Aichat key={index} expression={message.expression || ""} message={message.message.replace("Typing...", "")} />
    //                     ) : (
    //                       <div key={index} className="flex w-full items-end justify-end gap-3">
    //                         <div className="bg-yellow-500border-slate-400 border-2 font-black capitalize px-6 py-2 rounded-md">
    //                           {message.message}
    //                         </div>
    //                       </div>
    //                     )
    //                   )}
    //                   <div></div>
    //                 </div>
    //               </ScrollArea>
    //               <div className="absolute bottom-24 flex items-center justify-center"></div>
    //               <div className="bg-white flex-grow">
    //                 <div className="flex h-fit items-end">
    //                   {/* expression */}
    //                   <div className="mx-2">
    //                     <MateyExpression expression={mateyExpression} />
    //                   </div>
    //                   <div className="flex items-end p-1 rounded-md border-2 border-slate-400 w-full">
    //                     <div className="flex items-center justify-center w-full mb-2">
    //                       <textarea
    //                         placeholder="Need Tool Advice? Start Typing..."
    //                         className="rounded-lg mt-2 w-full resize-none p-0 m-0 border-none outline-none bg-transparent text-black placeholder-black"
    //                         value={mainInput}
    //                         ref={textareaRef}
    //                         onChange={(e) => setMainInput(e.target.value)}
    //                         rows={1}
    //                       />
    //                     </div>
    //                     <button onClick={handleUserPrompt} className="bg-gradient-to-tr mb-1 from-orange to-lightOrange rounded-md p-2 hover:from-orange/80 hover:to-lightOrange/80">
    //                       {stateOfButton === -1 ? (
    //                         <Send size={22} />
    //                       ) : stateOfButton === 0 ? (
    //                         <LoaderPinwheel className="animate-spin" />
    //                       ) : (
    //                         <div className="w-1 h-1 bg-slate-500 rounded-sm "></div>
    //                       )}
    //                     </button>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </TabsContent>
    //     </div>
    //   </div>
    // </Tabs>
  );
}

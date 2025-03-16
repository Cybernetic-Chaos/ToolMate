import { useSocket } from "@/context/socketContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Flower, LoaderPinwheel, Send, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";

import { v4 as uuidv4 } from 'uuid';

export default function PreviewChat() {
  // global state
  const { toast } = useToast()




  //component  state
  // - this state is related to create session
  const [isSessionLoading, setIsSessionLoading] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState(true)
  const [isFreePlanOver, setIsFreePlanOver] = useState(false)
  const [currentCredit, setCurrentCredit] = useState(0)
  const [mainInput, setMainInput] = useState("")
  const socket = useSocket();
  const [uuid, setUuid] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTerminated, setIsTerminated] = useState(false)
  // create new session 


  async function getSessionDetails() {
    setIsSessionLoading(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/preview/createSession`, {
        withCredentials: true
      });
      if (!res.data.success) {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive"
        })
        setIsSessionValid(false)
      }

      if (res.data.isSessionOver) {
        setIsFreePlanOver(true)
      }
      else {
        setCurrentCredit(res.data.credit)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "cant get session",
        variant: "destructive"
      })
    } finally {
      setIsSessionLoading(false)
    }
  }


  async function deductCredit() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/preview/deduct`, {
        withCredentials: true
      });
      if (!res.data.success) {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive"
        })
      }
      setCurrentCredit(res.data.credit || res.data.creditLeft)
      if (res.data.isTerminate) {
        setIsTerminated(res.data.isTerminate)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "cant get session",
        variant: "destructive"
      })

    }
  }

  useEffect(() => {
    console.log(currentCredit, "is fsdf")
  }, [currentCredit])

  useEffect(() => {
    if (!uuid || uuid == "") {
      setUuid(uuidv4())
    }
  }, [uuid])

  useEffect(() => {
    async function fetchData() {
      await getSessionDetails();

    }
    fetchData();

  }, [])


  async function handleSubmit() {
    console.log("emitted1")

    if (!socket) return;
    socket.emit("freeUserMessage", {
      prompt: mainInput,
      id: uuid,
      toolInventory: [`toolName:Hammer,Type:tool`]
    })
    console.log("emitted")
  }



  // JSX Bounday
  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center space-y-4">
          <LoaderPinwheel className="w-12 h-12 text-yellow animate-spin" />
          <p className="text-lg font-semibold text-gray-700">Loading Session...</p>
          <p className="text-sm text-gray-500">Please wait while we prepare your session.</p>
        </div>
      </div>
    )
  }


  if (!isSessionValid) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
        <ShieldX className="w-12 h-12 text-r  ed-500" />
        <p className="text-lg font-semibold text-red-500">Access Denied</p>
        <p className="text-center text-gray-600">You do not have permission to view this page. Please contact the administrator if you believe this is an error.</p>
      </div>
    )
  }


  return (
    <div className="flex items-center justify-center  w-full h-full">
      <div className="max-w-6xl">
        <button

          onClick={deductCredit}
          className="bg-orange text-white px-2 py-2 rounded-md">
          click
        </button>
        {/* conversation */}
        <div>

        </div>
        {
          currentCredit > 5 && (
            <div className="rounded-t-lg rounded-b-none bg-lightOrange mx-2 flex gap-2 font-semibold text-white">
              <Flower className="p-1 text-white" />
              <p>{currentCredit} Free Credits Remaining</p>
            </div>
          )
        }
        {
          currentCredit < 0 && (
            <div className="rounded-t-lg rounded-b-none bg-lightOrange mx-2 flex gap-2 font-semibold text-white">
              <Flower className="p-1 text-white" />
              <p>Free Credits Are Over</p>
            </div>
          )
        }
        <div className="border-2 border-orange max-w-4xl w-screen rounded-md overflow-hidden">

          <textarea
            value={mainInput}
            onChange={(e) => setMainInput(e.target.value)}
            placeholder="Give Your Idea To Matey."
            className=" bg-slate-50 pr-12 placeholder-slate-900 text-slate-900 border-none outline-none focus:ring-0 rounded-none rounded-t-none w-full max-w-4xl"
            rows={isExpanded ? 9 : 3}
            style={{ transition: "height 0.3s ease-in-out" }}
          />
          <div className="border-t-2 border-orange flex justify-end p-1">
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-orange text-white px-2 py-2 rounded-md">
              <Send />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

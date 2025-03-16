import { ArrowDownToDot, ExpandIcon, LoaderPinwheel, Send } from "lucide-react";
import MateyExpression from "./MateyExpression"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { MouseEventHandler } from "react";
export default function MateyInput({
    mainInput,
    setMainInput,
    isExpanded,
    setIsExpanded,
    mateyExpression,
    handleUserPrompt,
    stateOfButton,
    scrollToBottom,
}:{
    mainInput: string,
    setMainInput: Function,
    isExpanded: boolean,
    setIsExpanded: Function,
    mateyExpression: string,
    handleUserPrompt: MouseEventHandler<HTMLButtonElement>,
    stateOfButton: number,
    scrollToBottom: MouseEventHandler<HTMLDivElement>
}){



    return (
        <div className="sticky inset-x-0 bottom-0 m-2 flex flex-col items-center  bg-transparent">

        <div className="w-full flex gap-0 border-2 bg-slate-100 border-lightOrange mt-2 rounded-lg flex-col">
        <textarea
          value={mainInput}
          onChange={(e) => setMainInput(e.target.value)}
          placeholder="Give Your Idea To Matey."
          className="w-full rounded-t-lg rounded-b-none pr-12 bg-slate-50 outline-none focus:outline-none focus:ring-0 placeholder-slate-900 text-slate-900 transition-all duration-1000 ease-in-out"
          rows={isExpanded ? 9 : 3}
          style={{ transition: "height 0.3s ease-in-out" }}
        />
        <div className="p-2 h-14 border-t-2 border-lightOrange justify-between items-center w-full flex space-x-2">
          <div className="bg-transparent">
            <MateyExpression expression={mateyExpression} />
          </div>
          <div className="flex gap-4 items-center">
            <TooltipProvider>
              <Tooltip delayDuration={10}>
                <TooltipTrigger>
                  <div onClick={scrollToBottom}>
                    <ArrowDownToDot className="cursor-pointer text-slate-600 hover:text-orange" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scroll To Bottom</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip delayDuration={10}>
                <TooltipTrigger className="flex items-center justify-center">
                  <button
                    onClick={() => setIsExpanded((prev:boolean) => !prev)}
                    className="text-slate-600 hover:text-orange"
                  >
                    <ExpandIcon className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expand Text Area</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              onClick={handleUserPrompt}
              disabled={stateOfButton === 0 ? true : false}
              className="bg-orange rounded-md p-2 hover:bg-lightOrange hover:shadow-md hover:shadow-light"
            >
              {stateOfButton === -1 ? (
                <Send size={22} />
              ) : stateOfButton === 0 ? (
                <LoaderPinwheel className="animate-spin" />
              ) : (
                <div className="w-1 h-1 bg-slate-500 rounded-sm"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    )
}
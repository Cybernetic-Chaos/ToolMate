import { Bolt, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

interface DropdownProps {
  isDropdownOpen: boolean;
  setDropDown: (value: boolean) => void;
  isDropdownTyping: boolean;
  defaultDropdownMessage: string;
  message: string;
  giveStreamingEffect: boolean;
  isInDrawer?: boolean;
}

const ToolSuggestion: React.FC<DropdownProps> = ({
  isDropdownOpen,
  setDropDown,
  defaultDropdownMessage,
  isDropdownTyping,
  message,
  giveStreamingEffect,
  isInDrawer = false,
}) => {
  const [dropdownContent, setDropdownContent] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const collapseTimeout = 50;

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = setTimeout(() => {
        setShowPrice(true);
      }, 500 + collapseTimeout);
      return () => clearTimeout(timer);
    } else {
      setShowPrice(false);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownTyping && isDropdownOpen && giveStreamingEffect) {
      setDropdownContent(defaultDropdownMessage);
      let i = 0;
      const streamInterval = setInterval(() => {
        if (i < message.length) {
          setDropdownContent((prev) => prev + message[i]);
          i++;
        } else {
          clearInterval(streamInterval);
        }
      }, 50);

      return () => clearInterval(streamInterval);
    } else {
      setDropdownContent(defaultDropdownMessage + message);
    }
  }, [isDropdownTyping, isDropdownOpen, giveStreamingEffect, message]);

  const handleToggleDropdown = () => {
    setDropDown(!isDropdownOpen);
  };

  return (
    <div className={`p-[3px]  ${isInDrawer?"bg-white":"bg-slate-300"} rounded-md ${giveStreamingEffect ? 'animate-glow gradient-animation bg-gradient-to-r from-lightYellow to-lightOrange' : 'border-slate-600'}`}>
      <div className={`${isInDrawer?"bg-white":"bg-slate-200"} p-2 rounded-md relative cursor-pointer`}>
        <div onClick={handleToggleDropdown} className={`flex gap-2 ${isInDrawer?"justify-start":"justify-between"} items-center  mx-2`}>
          <div>
            <Bolt />
          </div>
          <p className="text-md font-bold">Tools Suggestion By Matey</p>
          <div className={`transform transition-transform duration-500 ease-in-out ${isInDrawer?"hidden":"block"}`}>
            {isDropdownOpen ? <ChevronDown /> : <ChevronUp />}
          </div>
        </div>

        {showPrice && (
          <div>
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-center w-4/5 p-4 rounded-md z-50 border border-black">
              <div className="flex justify-center items-center flex-col w-full">
                <div className="flex gap-2 items-center justify-center mb-3">
                  <img src="/assets/icons/lock.svg" alt="matey" width={15} />
                  <p className="text-lg font-bold">Get ToolMate Premium</p>
                </div>
                <div>
                  <p className="text-[5px] leading-4 text-slate-800">
                    Get Personalized Product Suggestion, Budget Calculation And More
                  </p>
                </div>
                <div className="w-[300px] h-fit p-4">
                  <Link to="/signup" className="bg-amber-200 hover:bg-amber-300 text-black px-4 py-2 rounded-md">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`dropdown-content transition-all duration-500 ease-in-out overflow-hidden ${isDropdownOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"
            }`}
          style={{ transitionDelay: `${collapseTimeout}ms` }}
        >
          <div className="blur-sm select-none pointer-events-none" style={{ userSelect: "none" }}>
            <Markdown remarkPlugins={[remarkGfm]} className="text-black text-left w-fit mt-8">
              {dropdownContent}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolSuggestion;

import SocketProvider from "@/context/socketContext";
import classNames from "classnames";
import { Columns2 } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toolbar } from "@/components/custom/Toolbar";
import { ToolSpread } from "@/components/custom/ToolSpread";
export function SocketLayout() {
    const [collapsed, setSidebarCollapsed] = useState(false);
    const {pathname} = useLocation()
    console.log(pathname,"n123")
    const toggleSidebar = () => {
        console.log("Toggling sidebar"); // Debug log
        setSidebarCollapsed(prevState => !prevState);
    };

    return (
        <SocketProvider>
            {/* <div className="grid grid-cols-[1fr_auto] h-screen"> */}
            {/* Main Content */}
            <div className="flex-grow relative w-full">
                <div className="w-full flex h-screen">
                    <div className={`${pathname.includes('preview') ? 'w-full':'md:w-3/5'} p-0`}>
                        <Outlet />
                    </div>
                    {
                        !pathname.includes('preview') && <div className={`md:w-[36%] w-full md:block hidden`}>
                        <ToolSpread />
                    </div>
                    }
                </div>

            </div>

        </SocketProvider>
    );
}


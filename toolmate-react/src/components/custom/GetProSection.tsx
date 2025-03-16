import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GetProSection() {

    return (
        <div className="w-full bg-gradient-to-b from-lightOrange to-softYellow flex px-2 py-2 rounded-lg">
            <img src="/assets/icons/boost.svg" alt="boost" height={60} width={80} />
            {/* content */}
            <div className="flex flex-col text-left">
                <p className="text-lg font-bold">Get Pro</p>
                <p className="text-xxs">Unlock All Tools Of Toolmate</p>
                <Link to={'/price'} className="underline flex gap-2 text-md items-center font-semibold">
                    Check Features
                    <ArrowRight />
                </Link>
            </div>
        </div>
    )
}
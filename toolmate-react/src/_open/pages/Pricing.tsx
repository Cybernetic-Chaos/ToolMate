import Price from "@/components/custom/Price";
import { useUser } from "@clerk/clerk-react";

export default function Pricing() {
    const {isSignedIn} = useUser();
    return (
        <div className="flex items-center justify-center  w-screen   ">

            <div className="w-[90%] mt-32">
                <Price />
            </div>
        </div>
    )
}
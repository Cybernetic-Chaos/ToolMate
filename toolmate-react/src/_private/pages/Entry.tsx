import Logo from "@/components/custom/Logo";
import LogoSmall from "@/components/custom/LogoSmall";
import MateyExpression from "@/components/custom/MateyExpression";
import { UserContext } from "@/context/userContext";
import { UserButton, UserProfile } from "@clerk/clerk-react";
import { CreditCard } from "lucide-react";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Entry() {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext)
    useEffect(() => {
        if (!(userData?.planAccess[0])) {
            navigate('/dashboard')
        }
    }, [])


    return (
        <div className="flex flex-col h-screen w-screen">
          

            <div className="bg-gradient-to-b from-white via-white to-mangoYellow h-screen w-screen">
                <header className="w-full h-fit flex justify-between items-center px-4 py-2">
                    <div className="md:block  hidden">
                        <Logo />
                    </div>
                    <div className="md:hidden block">
                        <LogoSmall />
                    </div>
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="Manage Your Subscription"
                                labelIcon={<CreditCard width={15} />}
                                onClick={() => navigate('/manage-subscription')}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                </header>

                <section className="flex flex-col items-center justify-center h-fit mt-56">
                    <div className="border-2 border-slate-300  px-4 py-2  rounded-md">
                        <div className="flex items-center justify-between">
                            <MateyExpression expression="tool" />
                            <div className="flex flex-col text-left">
                                <p className="text-xl font-semibold">You Are Using Free Plan</p>
                                <p className="capitalize">Upgrade to Premium for full access or use the daily preview Credits</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center px-4 py-3 gap-2 bg-slate-100 border-2 border-slate-400 rounded-md m-2">
                            <Link to="/pricing" className="w-full md:flex-1 px-4 py-2 border-2 border-softYellow rounded-md bg-softYellow hover:bg-yellow font-semibold text-center">Pricing</Link>
                            <Link to="/preview" className="w-full md:flex-1 px-4 py-2 border-2 border-softYellow rounded-md bg-softYellow hover:bg-yellow font-semibold text-center">Use Preview</Link>
                            <Link to="/" className="w-full md:flex-1 px-4 py-2 border-2 border-softYellow rounded-md bg-softYellow hover:bg-yellow font-semibold text-center">Home</Link>
                        </div>
                    </div>

                </section>
            </div>
        </div>
    )
}
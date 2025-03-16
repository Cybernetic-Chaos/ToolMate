import Logo from "@/components/custom/Logo";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LogoSmall from "@/components/custom/LogoSmall";

export default function DocsWrapper(content: {
    content: string
}) {
    console.log(content)
    return (
        <div>
            <div className="md:flex hidden w-screen bg-lighterYellow px-16 py-3 justify-between gap-7 items-center">
                <Logo />
                <nav className="flex space-x-4">
                    <Link to="/refund-policy" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">Refund Policy</Link>
                    <Link to="/AboutUs" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">About Us</Link>
                    <Link to="/community-guideline" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">Community Guideline</Link>
                    <Link to="/privacy-policy" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">Privacy Policy</Link>
                    <Link to="/terms-of-service" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">Terms of Service</Link>
                    <Link to="/safety-policy" className="px-2 py-1 hover:bg-yellow font-semibold text-black transition-all rounded-md">Safety Policy</Link>
                </nav>
            </div>

            <div className="px-5 py-3 md:hidden flex justify-between bg-lighterYellow ">
                <LogoSmall />
                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full bg-softYellow p-2">
                        <img src="/assets/line2.svg" alt="menu" className="w-8 h-8" />

                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <Link to="/refund-policy">Refund Policy</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/AboutUs">About Us</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/community-guideline">Community Guideline</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/privacy-policy">Privacy Policy</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/terms-of-service">Terms of Service</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/safety-policy">Safety Policy</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
            <div className="px-4 py-2 w-screen flex items-center justify-center h-full">
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    className="text-black text-left max-w-screen-md"
                >
                    {content.content}
                </Markdown>
            </div>
        </div>
    )
}
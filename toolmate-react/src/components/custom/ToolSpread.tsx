// ToolSpread.tsx
import { RightSidebarContext } from "@/context/rightSidebarContext"
import { Calendar, CircleHelp, DollarSign, ExternalLink, Info, Lock, Star, Tag } from "lucide-react"
import { useContext, useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import MateyExpression from "./MateyExpression"
import { useSocket } from "@/context/socketContext"
import { UserContext } from "@/context/userContext"
import CustomSlider from "@/components/custom/Slider"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"
import { getImageUrl } from "@/lib/utils"
import ProductDialog from "./ProductDialog"
import { useLocation } from "react-router-dom"

export function ToolSpread() {
    const socket = useSocket();
    const { userData } = useContext(UserContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { pathname } = useLocation()
    const {
        sliderValue,
        breakpoints,
        isSliderBreakPointEmpty,
        setIsBudgetOn,
        isBudgetOn,
        totalProductSuggestions,
        aiProduct,
        notificationRemove,
        vendorProduct,
        bunningProduct,
        notification,
        isBudgetChangable,
        setIsBudgetChangable,
        setSliderValue,
    } = useContext(RightSidebarContext);

    const isBudgetSliderAccessable = pathname == '/preview' ? true : userData?.planAccess[2]

    const handleBudgetChange = (value: boolean) => {
        socket?.emit("tempTest", {
            isBudgetOn: value,
            budget: sliderValue,
            isBudgetChangable
        })
        setIsBudgetOn(value)
    }

    const handleBudgetAdjustChange = (value: boolean) => {
        socket?.emit("tempTest", {
            isBudgetOn: value,
            budget: sliderValue,
            isBudgetChangable
        })
        setIsBudgetChangable(value)
    }

    return (
        <div className="w-full p-2 flex-col flex gap-2">
            {/* Product Suggestions Section */}
            <div className="border-softYellow shadow-md border rounded-md p-4">
                <div className="flex rounded-lg mb-2 gap-2 flex-col">
                    <div className="flex items-center gap-2">
                        <img src="/assets/icons/Tick.svg" alt="" className="w-5 h-5" />
                        <p className="font-semibold">Material And Product Suggestion</p>
                    </div>
                    <Separator className="border border-slate-700" />
                </div>


                <div
                    onClick={() => {
                        notificationRemove();
                        setIsDialogOpen(true);
                    }}
                >
                    <ProductSuggestionTrigger
                        notification={notification}
                        totalProductSuggestions={totalProductSuggestions}
                    />
                </div>

                <ProductDialog
                    isOpen={isDialogOpen}
                    setIsOpen={() => setIsDialogOpen(false)}
                    bunningsProduct={bunningProduct}
                    mateyMadeProduct={aiProduct}
                    vendorProduct={vendorProduct}
                />

            </div>

            {/* Budget Selection Section */}
            <BudgetSection
                isSliderBreakPointEmpty={isSliderBreakPointEmpty}
                isBudgetOn={isBudgetOn}
                onBudgetChange={handleBudgetChange}
                isBudgetChangable={isBudgetChangable}
                onBudgetAdjustChange={handleBudgetAdjustChange}
                breakpoints={breakpoints}
                sliderValue={sliderValue}
                setSliderValue={setSliderValue}
            />

        </div>
    )
}

// Helper Components
const ProductSuggestionTrigger = ({ notification, totalProductSuggestions }: {
    notification: number,
    totalProductSuggestions: number
}) => (
    <div className="-m-2 my-2">
        <div className="relative flex border-2 border-softYellow gap-2 items-center bg-whiteYellow px-2 py-1 text-left hover:bg-paleYellow transition-all duration-150 cursor-pointer rounded-md ml-2 mt-2">
            <div className={`${notification === 0 ? "hidden" : ""} text-white font-semibold animate-pulse bg-red-500 absolute -top-2 -right-2 py-1 px-2 rounded-full`}>
                {notification}
            </div>
            <img
                src="/assets/icons/prod-placeholder.svg"
                alt="bunnings"
                className="w-16 h-16 rounded-md shadow-xl"
            />
            <div>
                <p className="font-semibold">Click To View Suggestions</p>
                <p className="text-slate-500">{totalProductSuggestions} suggestion</p>
            </div>
        </div>
    </div>
)

const LockedBudgetSection = () => (
    <div className="flex rounded-lg mb-2 gap-2 flex-col px-4 py-2">
        <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-2 items-center">
                <img src="/assets/icons/Tick.svg" alt="" className="w-5 h-5" />
                <p className="font-semibold">Budget Selection</p>
            </div>
            <div className="rounded-full flex gap-2 bg-whiteYellow px-2 py-1 border border-slate-500">
                <p className="font-semibold">Access In Pro Plan</p>
                <Lock className="w-5 h-5" />
            </div>
        </div>
        <Separator className="border border-slate-700" />
    </div>
)

interface BudgetSectionProps {
    isSliderBreakPointEmpty: boolean
    isBudgetOn: boolean
    onBudgetChange: (value: boolean) => void
    isBudgetChangable: boolean
    onBudgetAdjustChange: (value: boolean) => void
    breakpoints: any[]
    sliderValue: number
    setSliderValue: (value: number) => void
}

const BudgetSection = ({
    isSliderBreakPointEmpty,
    isBudgetOn,
    onBudgetChange,
    isBudgetChangable,
    onBudgetAdjustChange,
    breakpoints,
    sliderValue,
    setSliderValue
}: BudgetSectionProps) => (
    <div className="border-softYellow shadow-md border rounded-md">
        <div className="flex rounded-lg mb-2 gap-2 flex-col px-4 py-2">
            <div className="flex items-center gap-2 justify-between">
                <div className="flex gap-2 items-center">
                    <img src="/assets/icons/Tick.svg" alt="" className="w-5 h-5" />
                    <p className="font-semibold">Budget Selection</p>
                </div>
            </div>
            <Separator className="border border-slate-700" />
        </div>

        {isSliderBreakPointEmpty ? (
            <EmptySliderState />
        ) : (
            <>
                <div className="p-4">
                    <CustomSlider />
                </div>
                <BudgetControls
                    isBudgetOn={isBudgetOn}
                    onBudgetChange={onBudgetChange}
                    isBudgetChangable={isBudgetChangable}
                    onBudgetAdjustChange={onBudgetAdjustChange}
                />
                <BudgetBreakpoints
                    breakpoints={breakpoints}
                    sliderValue={sliderValue}
                    setSliderValue={setSliderValue}
                />
            </>
        )}
    </div>
)

const EmptySliderState = () => (
    <div className="my-2 rounded-lg p-4">
        <div className="w-full bg-paleYellow flex flex-col gap-2 items-center rounded-lg p-4">
            <MateyExpression expression="laugh" />
            <p className="w-3/4">Keep Chating ! Matey Will Create personalized Budget Slider Soon !</p>
        </div>
    </div>
)

const BudgetControls = ({
    isBudgetOn,
    onBudgetChange,
    isBudgetChangable,
    onBudgetAdjustChange
}: {
    isBudgetOn: boolean
    onBudgetChange: (value: boolean) => void
    isBudgetChangable: boolean
    onBudgetAdjustChange: (value: boolean) => void
}) => (
    <div className="border-t-2 border-softYellow p-5 flex flex-col gap-2">
        <BudgetToggle
            label="Lock Budget"
            checked={isBudgetOn}
            onCheckedChange={onBudgetChange}
            tooltip="When enabled, Matey will suggest materials and products based on your budget. Turn it off if you don't want budget-based suggestions."
        />
        <BudgetToggle
            label="Adjust Budget"
            checked={isBudgetChangable}
            onCheckedChange={onBudgetAdjustChange}
            tooltip="When 'Adjust Budget' is enabled, Matey can adjust the current budget slider. Turn it off to prevent Matey from changing the budget slider Formats."
        />
    </div>
)

interface BudgetToggleProps {
    label: string
    checked: boolean
    onCheckedChange: (value: boolean) => void
    tooltip: string
}

const BudgetToggle = ({ label, checked, onCheckedChange, tooltip }: BudgetToggleProps) => (
    <div className="flex gap-2 items-center font-semibold">
        <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="data-[state=checked]:bg-lightOrange data-[state=unchecked]:bg-slate-400"
        />
        <p>{label}</p>
        <div>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger>
                        <CircleHelp className="w-4 h-4 mt-1" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-mangoYellow border border-slate-400">
                        <p className="max-w-md text-wrap">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
)

interface BudgetBreakpointsProps {
    breakpoints: any[]
    sliderValue: number
    setSliderValue: (value: number) => void
}

const BudgetBreakpoints = ({ breakpoints, sliderValue, setSliderValue }: BudgetBreakpointsProps) => (
    <div className="border-t-2 border-softYellow p-5 grid grid-cols-2">
        {breakpoints.map((item, index) => {
            const activePoint = item.value === sliderValue
            return (
                <div
                    key={index}
                    onClick={() => setSliderValue(item.value)}
                    className={`flex flex-col px-2 bg-paleYellow cursor-pointer p-2 rounded-md transition-all duration-200 border-2 border-white text-left ${activePoint ? "bg-softYellow" : "hover:bg-paleYellow"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{item.value}</p>
                        <p className="text-sm text-gray-600">{item.label}</p>
                    </div>
                </div>
            )
        })}
    </div>
)

// Export constants
export const productSuggestionsTabs = [
    {
        img: "/assets/icons/new-placeholder.svg",
        name: "bunnings",
        tooltip: "Bunnings Product Suggestion",
    },
    {
        img: "/assets/icons/ai-placeholder.svg",
        name: "ai",
        tooltip: "Product Suggestion By Matey",
    },
    {
        img: "/assets/icons/vendor-placeholder.svg",
        name: "vendor",
        tooltip: "Vendor Product Suggestion",
    }
]

const HeadingName = (currState: string) => {
    switch (currState) {
        case "bunnings":
            return <div className="flex flex-col text-left px-4 py-1 w-fit">
                <p className="font-semibold text-left text-xl">Bunnings Product Suggestion</p>
                <div className="flex gap-2">
                    <p className="">Matey Have picked this Products From Bunnings</p>
                    <p className="text-slate-500 font-semibold">Click To Active </p>
                </div>
            </div>
        case "ai":
            return <div className="flex flex-col text-left px-4 py-1">
                <p className="font-semibold text-left text-xl">Matey's Product Suggestions</p>
                <div className="flex gap-2">
                    <p>Matey Have Created This Product</p>
                </div>
            </div>
        case "vendor":
            return <div className="flex flex-col text-left px-4 py-1">
                <p className="font-semibold text-left text-xl">Vendor Product Suggestions</p>
                <div className="flex gap-2">
                    <p>Matey Have Picked This Products From Vendors Listed On Toolmate</p>
                    <p className="text-slate-500 font-semibold">Click To Active </p>
                </div>
            </div>
    }
}
export const ProductDetails = ({ sidebarProductDetails }: any) => (
    <div className="flex flex-col gap-2 w-full h-full p-4 hide-scrollbar rounded-lg">
        {/* Image Section */}
        <div className="relative">
            <img
                src={sidebarProductDetails?.image}
                alt={sidebarProductDetails?.name}
                className="w-full h-48 object-contain rounded-lg border-2 border-softYellow bg-white shadow-md"
            />
            {/* Price Tag */}
            <div className="absolute top-2 right-2 bg-yellow px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray" />
                <span className="font-bold text-gray">${sidebarProductDetails?.price || 'N/A'}</span>
            </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray leading-tight">
            {sidebarProductDetails?.name || 'No Name'}
        </h2>

        {/* View Product Link */}
        <a
            href={sidebarProductDetails?.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-lightYellow hover:bg-yellow transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 text-gray"
        >
            <span>View Product</span>
            <ExternalLink className="w-4 h-4" />
        </a>

        {/* Details Section */}
        <div className="flex flex-col gap-2 mt-1">
            {/* Rating */}
            <div className="flex items-center gap-2 p-2 rounded-md bg-lighterYellow">
                <Star className="w-5 h-5 text-darkYellow" />
                <span className="font-semibold text-gray">Rated By: {sidebarProductDetails?.rating || 'N/A'}</span>
            </div>
            {/* Usage/Description */}
            <div className="p-2 rounded-md flex gap-2 bg-paleYellow">
                <Info className="w-5 h-5 flex-shrink-0 text-deepYellow text-left" />
                <div className="text-left">
                    <span className="font-semibold text-gray">Usage: </span> <br />
                    <span className="text-gray">{sidebarProductDetails?.personalUsage || 'N/A'}</span>
                </div>
            </div>
        </div>
    </div>
);






export const VendorProductDetails = ({ sidebarProductDetails }: any) => (
    <div className="flex flex-col gap-2 w-full h-full hide-scrollbar p-3 rounded-lg">
        {/* Image Section with Carousel */}
        <div className="relative">
            <Carousel>
                <CarouselContent>
                    {sidebarProductDetails?.imageParams.map((image: string, index: number) => (
                        <CarouselItem key={index}>
                            <img
                                src={getImageUrl(image)}
                                alt={sidebarProductDetails?.name}
                                className="w-full h-48 object-contain rounded-lg border-2 border-softYellow bg-white shadow-md"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2" />
                <CarouselNext className="absolute right-2" />
            </Carousel>

            {/* Price Tag */}
            <div className="absolute top-2 right-2 bg-yellow px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray" />
                <span className="font-bold text-gray">${sidebarProductDetails?.price || 'N/A'}</span>
            </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray leading-tight">
            {sidebarProductDetails?.name || 'No Name'}
        </h2>

        {/* View Product Link */}
        <a
            href={sidebarProductDetails?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-lightYellow hover:bg-yellow transition-colors px-4 py-2 rounded-md flex items-center justify-center gap-2 text-gray"
        >
            <span>View Live</span>
            <ExternalLink className="w-4 h-4" />
        </a>

        {/* Details Section */}
        <div className="flex flex-col gap-2 mt-1">
            {/* Description */}
            <div className="p-2 rounded-md bg-lighterYellow">
                <div className="flex gap-2">
                    <Info className="w-5 h-5 flex-shrink-0 text-darkYellow mt-1" />
                    <p className="text-gray text-left">{sidebarProductDetails?.description || 'No description available'}</p>
                </div>
            </div>

            {/* Special Offer */}
            {sidebarProductDetails?.offerDescription && (
                <div className="p-2 rounded-md bg-mangoYellow flex items-center gap-2">
                    <Tag className="w-5 h-5 text-deepYellow" />
                    <span className="text-gray font-semibold">{sidebarProductDetails.offerDescription}</span>
                </div>
            )}

            {/* Created Date */}
            <div className="p-2 rounded-md flex gap-2 bg-paleYellow">
                <Calendar className="w-5 h-5 flex-shrink-0 text-deepYellow" />
                <div>
                    <span className="font-semibold text-gray">Listed on: </span>
                    <span className="text-gray">
                        {new Date(sidebarProductDetails?.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    </div>
);
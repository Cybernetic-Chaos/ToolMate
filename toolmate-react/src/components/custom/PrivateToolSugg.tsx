import * as React from "react"
import { ChevronDown, ChevronUp, Hexagon, X, Check, ShoppingCart, ArrowUpRight, Bolt } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { Button } from "@/components/ui/button"
import MateyExpression from "./MateyExpression"

export default function PrivateToolSugg() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [openDD, setOpenDD] = React.useState(false)
    const [selectedTool, setSelectedTool] = React.useState("Hammer")
    const isMobile = useMediaQuery("(max-width: 640px)")
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-lg flex flex-col  shadow-sm overflow-hidden border-2 border-black">
            <Button
                variant="ghost"
                className="flex py-2 h-12  items-center justify-between bg-softYellow hover:bg-lightYellow rounded-t-md rounded-b-none w-full p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-4 py-2 ">
                    <Bolt className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">Suggested Tools By Matey</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </Button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="p-4 border-t max-h-72  ">
                            <ul className="space-y-3 flex flex-col justify-start">
                                <li className="flex flex-col justify-start text-left">
                                    <span className="font-semibold text-gray-700 list-disc">Power Tools</span>
                                    <ul className="pl-2 mt-1 space-y-1 text-gray-600">
                                        <li className="list">Power Drill</li>
                                        <li className=" ">Driller</li>
                                    </ul>
                                </li>
                                <li className="flex flex-col justify-start text-left">
                                    <span className="font-semibold text-gray-700  ">Hand Tools</span>
                                    <ul className="pl-2 mt-1 space-y-1 text-gray-600">
                                        <li className=" ">Hammer</li>
                                        <li className=" ">Nails</li>
                                    </ul>
                                </li>
                            </ul>
                            <Dialog.Root open={openDD} onOpenChange={setOpenDD}>
                                <Dialog.Trigger asChild>
                                    <Button variant="outline" className=" mt-3 w-full bg-lightYellow hover:bg-deepYellow flex justify-start">
                                        <div className="flex gap-2  items-center justify-start">
                                            <ArrowUpRight />
                                            View Full List
                                        </div>
                                    </Button>
                                </Dialog.Trigger>
                                <AnimatePresence>
                                    {openDD && (
                                        <Dialog.Portal forceMount>
                                            <Dialog.Overlay asChild forceMount>
                                                <motion.div
                                                    className="fixed inset-0 bg-black/50 z-50"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            </Dialog.Overlay>
                                            <Dialog.Content asChild forceMount>
                                                <motion.div
                                                    className={`fixed inset-0 z-50 flex items-center justify-center ${isMobile ? "p-0" : "p-4"}`}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className={`bg-white w-2/3  ${isMobile ? "h-full" : "rounded-lg shadow-xl"} flex flex-col`}>
                                                        <div className="flex items-center justify-between p-4 border-b">
                                                            <div className="flex items-center space-x-2">
                                                                <MateyExpression expression="1thumb" />
                                                                <div>
                                                                    <h2 className="text-lg font-semibold">Tools And Product Suggested By Matey</h2>
                                                                    <p className="text-sm text-slate-500">Matey has tailored the best products for this project for you!</p>
                                                                </div>
                                                            </div>
                                                            <Dialog.Close asChild>
                                                                <button className="text-slate-400 hover:text-slate-500">
                                                                    <X className="w-6 h-6" />
                                                                </button>
                                                            </Dialog.Close>
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="h-full flex flex-col sm:flex-row">
                                                                <ScrollArea.Root className="w-full sm:w-2/3 h-[50vh] sm:h-full">
                                                                    <ScrollArea.Viewport className="w-full h-full">
                                                                        <div className="p-4 space-y-2">
                                                                            {toolCategories.map((category) => (
                                                                                <div key={category.name} className="bg-slate-100 p-4 rounded-lg">
                                                                                    <h3 className="font-semibold mb-2">{category.name}</h3>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {category.tools.map((tool) => (
                                                                                            <button
                                                                                                key={tool}
                                                                                                className={`px-3 py-1 rounded-full text-sm ${tool === selectedTool
                                                                                                    ? "bg-yellow text-yellow-800"
                                                                                                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                                                                                                    }`}
                                                                                                onClick={() => setSelectedTool(tool)}
                                                                                            >
                                                                                                {tool}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </ScrollArea.Viewport>
                                                                    <ScrollArea.Scrollbar
                                                                        className="flex select-none touch-none p-0.5 bg-slate-200 transition-colors duration-[160ms] ease-out hover:bg-slate-300 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                                                                        orientation="vertical"
                                                                    >
                                                                        <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                                                                    </ScrollArea.Scrollbar>
                                                                </ScrollArea.Root>
                                                                <div className="w-full sm:w-1/3 p-4 bg-slate-100">
                                                                    <h3 className="font-semibold mb-2">{selectedTool}</h3>
                                                                    <Button variant="outline" className="w-full mb-2">
                                                                        <Check className="w-4 h-4 mr-2" />
                                                                        Already Own This Tool
                                                                    </Button>
                                                                    <Button variant="outline" className="w-full mb-4">
                                                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                                                        On Your Wish List
                                                                    </Button>
                                                                    <div className="space-y-2 mb-4">
                                                                        <label className="flex items-center space-x-2">
                                                                            <input type="radio" name="store" defaultChecked />
                                                                            <span>Bunnings Store</span>
                                                                        </label>
                                                                        <label className="flex items-center space-x-2">
                                                                            <input type="radio" name="store" />
                                                                            <span>Amazon.com</span>
                                                                        </label>
                                                                    </div>
                                                                    <Button className="w-full bg-darkYellow hover:bg-deepYellow text-white">
                                                                        Buy Now
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Dialog.Content>
                                        </Dialog.Portal>
                                    )}
                                </AnimatePresence>
                            </Dialog.Root>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}



function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState(false)

    React.useEffect(() => {
        const media = window.matchMedia(query)
        if (media.matches !== matches) {
            setMatches(media.matches)
        }
        const listener = () => setMatches(media.matches)
        media.addListener(listener)
        return () => media.removeListener(listener)
    }, [matches, query])

    return matches
}

const toolCategories = [
    {
        name: "Hand Tools",
        tools: ["Hammer", "Screwdriver", "Wrench", "Pliers", "Chisel", "Level", "Tape Measure"]
    },
    {
        name: "Power Tools",
        tools: ["Drill", "Circular Saw", "Jigsaw", "Sander", "Router", "Angle Grinder", "Impact Driver"]
    },
    {
        name: "Gardening Tools",
        tools: ["Spade", "Rake", "Pruning Shears", "Hoe", "Trowel", "Watering Can", "Wheelbarrow"]
    },
    {
        name: "Painting Supplies",
        tools: ["Paintbrush", "Roller", "Paint Tray", "Masking Tape", "Drop Cloth", "Sandpaper", "Paint Sprayer"]
    }
]
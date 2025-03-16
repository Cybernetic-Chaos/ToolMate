import React, { useContext, useState, useEffect } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ToolbarLabel } from "./ToolbarLabel";
import { Tag } from "lucide-react";
import { RightSidebarContext } from "@/context/rightSidebarContext";
import MateyExpression from "./MateyExpression";

// Separate component for tooltip
const ToolTipExpose = ({ tooltip, showTooltip }: { tooltip: string, showTooltip: boolean }) => {
    const [isReadExpand, setIsReadExpand] = useState(false);
    useEffect(() => {
        if (!showTooltip) {
            setIsReadExpand(false);
        }
    }, [showTooltip])
    return (
        <div className="max-w-lg text-wrap">
            {tooltip.length > 45 ? (
                <div>
                    <p>
                        {isReadExpand ? tooltip : `${tooltip.slice(0, 45)}...`}
                        <span
                            className="text-black font-semibold underline cursor-pointer ml-1"
                            onClick={() => setIsReadExpand(!isReadExpand)}
                        >
                            {isReadExpand ? "Read Less" : "Read More"}
                        </span>
                    </p>
                </div>
            ) : (
                <p>{tooltip}</p>
            )}
        </div>
    );
};

export default function CustomSlider() {

    const {
        sliderValue,
        setSliderValue,
        breakpoints,
        isSliderBreakPointEmpty,
    } = useContext(RightSidebarContext);

    const [value, setValue] = useState([sliderValue]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [min, setMin] = useState(Infinity);
    const [max, setMax] = useState(0);
    let hideTooltipTimeout: NodeJS.Timeout;

    useEffect(() => {
        setValue([sliderValue]);
        // handleMouseEnter();
        // handleMouseLeave(2000);
    }, [sliderValue])

    useEffect(() => {
        setMin(breakpoints.reduce((acc, curr) => {
            if (acc > curr.value) {
                acc = curr.value;
            }
            return acc; // Ensure acc is returned here
        }, Infinity));

        setMax(breakpoints.reduce((acc, curr) => {
            if (acc < curr.value) {
                acc = curr.value;
            }
            return acc; // Ensure acc is returned here
        }, 0));
    }, [breakpoints]);

    const getCurrentTooltip = () => {
        const currentValue = value[0];
        for (let i = breakpoints.length - 1; i >= 0; i--) {
            if (currentValue >= breakpoints[i].value) {
                return {
                    label: breakpoints[i].label,
                    tooltip: breakpoints[i].tooltip,
                };
            }
        }
        return {
            label: "",
            tooltip: "",
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = parseInt(e.target.value);
        const boundedValue = Math.min(inputValue, max);
        setValue([boundedValue]);
        setSliderValue(boundedValue);
    };

    const handleMouseLeave = (delay: number) => {
        hideTooltipTimeout = setTimeout(() => {
            setShowTooltip(false);
        }, delay); // Use the delay argument
    };

    const handleMouseEnter = () => {
        clearTimeout(hideTooltipTimeout);
        setShowTooltip(true);
    };

    if (isSliderBreakPointEmpty) {
        return <div className="flex justify-center items-center flex-col gap-4 my-10">
            <MateyExpression expression="1thumb" />
            <p className=" font-semibold">Keep Chating Matey Will Create Personalized Budget Slider For You Soon.</p>
        </div>
    }

    return (
        <div className="w-full ">
            <div className="relative pt-1">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: showTooltip ? 1 : 0, scale: showTooltip ? 1 : 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full bg-lightYellow border-2 border-black shadow-lg rounded-lg text-left text-md font-semibold text-black"
                    onMouseEnter={handleMouseEnter}
                // onMouseLeave={() => handleMouseLeave(2000)} // Pass the delay duration here
                >
                    <div className="p-2">{getCurrentTooltip().label}</div>

                    <hr className="border border-black w-full" />

                    <div className="p-2 font-medium h-full"><ToolTipExpose tooltip={getCurrentTooltip().tooltip} showTooltip={showTooltip} /></div>
                </motion.div>

                <div className="flex items-center gap-4 mb-4 mt-5 cursor-pointer">
                    <SliderPrimitive.Root
                        className="relative mr-1 flex items-center select-none touch-none w-full h-5"
                        value={value}
                        onValueChange={(newValue) => {
                            const boundedValue = [Math.max(min, Math.min(newValue[0], max))];
                            setValue(boundedValue);
                            setSliderValue(boundedValue[0]); // Update the context value
                            setShowTooltip(true); // Show tooltip while changing value
                        }} // Enforce min and max
                        min={min}   
                        max={max}
                        onMouseEnter={handleMouseEnter}
                        onTouchStart={handleMouseEnter} // Show tooltip on touch start
                        onTouchEnd={() => handleMouseLeave(2000)} // Pass the delay duration here
                    >
                        <SliderPrimitive.Track className="bg-slate-700 relative grow rounded-full h-2">
                            <SliderPrimitive.Range className="absolute bg-yellow-500 rounded-full h-full" />
                        </SliderPrimitive.Track>

                        {breakpoints.map((breakpoint, index) => (
                            <React.Fragment key={index}>
                                <div
                                    className="absolute h-4 w-1 rounded-full bg-black"
                                    style={{
                                        left: `${((breakpoint.value - min) / (max - min)) * 100}%`,
                                    }} // Adjust for min
                                />
                                <div
                                    className={`absolute text-xs font-semibold bottom-[-1.5rem] transform -translate-x-1/2 text-black top-7`}
                                    style={{
                                        left: `${((breakpoint.value - min) / (max - min)) * 100}%`,
                                    }} // Adjust for min
                                >
                                    {breakpoint.value}
                                </div>
                            </React.Fragment>
                        ))}

                        <SliderPrimitive.Thumb className="block w-5 h-5 bg-black border-2 border-yellow-500 rounded-full shadow-lg focus:outline-none" />
                    </SliderPrimitive.Root>
                </div>

                <div className="mt-5">
                    <Input
                        type="number"
                        placeholder={`$${min} - $${max}`} // Update placeholder to reflect min and max
                        value={value[0]}
                        onChange={handleInputChange}
                        className="border-2 border-black w-full pl-6 mt-10"
                    />
                </div>
            </div>
        </div>
    );
}

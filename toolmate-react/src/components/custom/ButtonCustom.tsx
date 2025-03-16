import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ButtonCustom({
    navigator,
    text,
    isArrow,
    isDark,
    size = "large",
}: {
    navigator: string;
    text: string;
    isArrow: boolean;
    isDark: boolean;
    size?: "small" | "medium" | "large";
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(navigator);
    };

    const sizeClasses = {
        small: "px-3 rounded-md py-2 text-md",
        medium: "px-4 py-2 text-base",
        large: "px-5 py-3 text-lg md:px-6 md:py-4",
    };

    const commonClasses = `w-fit flex items-center justify-center gap-2 rounded-lg transition-all ${sizeClasses[size]}`;

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    return (
        <motion.button
            onClick={handleClick}
            className={`${commonClasses} ${isDark
                ? 'bg-gradient-to-tr from-orange to-lightOrange text-white border-2 border-transparent hover:from-white hover:to-white hover:border-orange hover:text-orange'
                : 'bg-gradient-to-tr from-white to-white text-orange border-2 border-orange hover:from-orange hover:to-lightOrange hover:text-white'
                } shadow-lg`}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
        >
            <div className="flex items-center justify-center gap-2">
                <p className="font-semibold">{text}</p>
                {isArrow && <ArrowRight />}
            </div>
        </motion.button>
    );
}

export default ButtonCustom;

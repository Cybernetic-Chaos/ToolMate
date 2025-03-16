import { useEffect, useState } from "react";
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

export function ToolbarMateyExp({
    expression,
    isMateyOpen,
}: {
    expression: string,
    isMateyOpen: boolean;
}) {
    const [expressionState, setExpressionState] = useState<string>('hello');

    useEffect(() => {
        setExpressionState(expression);
    }, [expression]);

    return (
        <div
            className={`${isMateyOpen ? "flex" : "hidden"} items-center p-2 rounded-md mt-2 h-full mb-2 relative`}
            style={{
                backgroundImage: 'url(/assets/images/matey-bg.png)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            }}
        >
            <RenderImage expression={expressionState} />
        </div>
    );
}

type Props = {
    expression: string;
};

const expressionMap: { [key: string]: string } = {
    hello: '/assets/matey/helloing.svg',
    confident: '/assets/matey/confident.svg',
    directing: '/assets/matey/directing.svg',
    exited: '/assets/matey/exited.svg',
    explaining: '/assets/matey/explaining.svg',
    presenting: '/assets/matey/presenting.svg',
    thinking: '/assets/matey/thinking.svg',
    thumbsUp: '/assets/matey/thumbsUp.svg',
    tools: '/assets/matey/tools.svg',
    bothThumbsUp: '/assets/matey/bothThumbsUp.svg',
};

const RenderImage: React.FC<Props> = ({ expression }) => {
    const imageUrl = expressionMap[expression];

    if (!imageUrl) {
        <AnimatePresence>
            <motion.img
                key={imageUrl} // Make sure the image gets re-rendered on expression change
                src={'/assets/matey/helloing.svg'}
                alt={'hello'}
                className="absolute w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </AnimatePresence> // Fallback if the expression doesn't match
    }

    return (
        <AnimatePresence>
            <motion.img
                key={imageUrl} // Make sure the image gets re-rendered on expression change
                src={imageUrl}
                alt={expression}
                className="absolute w-full h-80 object-contain mb-7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </AnimatePresence>

    );
};

export default RenderImage;

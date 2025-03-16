"use client"

import React, { useRef, useEffect, useState } from 'react'

interface TextOverflowProps {
    text: string
    className?: string
}

export default function TextOverflow({ text, className = '' }: TextOverflowProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [displayText, setDisplayText] = useState(text)

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current) {
                const container = containerRef.current
                const containerWidth = container.clientWidth

                // Create a temporary span to measure text width
                const tempSpan = document.createElement('span')
                tempSpan.style.visibility = 'hidden'
                tempSpan.style.position = 'absolute'
                tempSpan.style.whiteSpace = 'nowrap'
                tempSpan.style.font = window.getComputedStyle(container).font
                document.body.appendChild(tempSpan)

                // Binary search to find the maximum number of characters that fit
                let low = 0
                let high = text.length
                while (low <= high) {
                    const mid = Math.floor((low + high) / 2)
                    tempSpan.textContent = text.slice(0, mid)
                    if (tempSpan.offsetWidth <= containerWidth) {
                        low = mid + 1
                    } else {
                        high = mid - 1
                    }
                }

                // Remove the temporary span
                document.body.removeChild(tempSpan)

                // Set the display text, ensuring we don't cut off in the middle of a word
                const lastSpace = text.slice(0, high).lastIndexOf(' ')
                const cutoff = lastSpace > 0 ? lastSpace : high
                setDisplayText(text.slice(0, cutoff))
            }
        }

        checkOverflow()
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [text])

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
        >
            {displayText}
        </div>
    )
}
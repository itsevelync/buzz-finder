"use client";

import { useEffect, useRef, useState } from "react";
import { LuInfo, LuCheck, LuStar, LuMapPinXInside } from "react-icons/lu";

interface ItemTypeBadgeProps {
    type: "found" | "lost";
}

export default function ItemTypeBadge({ type }: ItemTypeBadgeProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isFound = type === "found";

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-fit mx-auto sm:mx-0 flex items-center justify-center">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    isFound
                        ? "border-buzz-gold/45 bg-buzz-gold/8 text-buzz-gold hover:bg-buzz-gold/15"
                        : "border-buzz-blue/40 bg-buzz-blue/3 text-buzz-blue hover:bg-buzz-blue/6"
                }`}
            >
                {isFound ? (
                    <LuStar className="h-3 w-3" />
                ) : (
                    <LuMapPinXInside className="h-3 w-3" />
                )}

                {isFound ? "Found Item" : "Lost Item"}

                <LuInfo className="h-3 w-3 opacity-80 -mr-0.5" />
            </button>

            {open && (
                <div className="absolute sm:left-0 top-full z-20 mt-3 w-80 max-w-[80vw]">
                    {/* Arrow */}
                    <div className="z-1 absolute -top-1.5 left-1/2 sm:left-6 h-3 w-3 rotate-45 border-l border-t border-foreground/15 bg-background" />

                    {/* Bubble */}
                    <div className="relative rounded-lg border border-foreground/15 bg-background p-4 shadow">
                        <p className="text-sm text-foreground/80">
                            {isFound ? (
                                <>
                                    This is a <b className="text-foreground">found item</b>. Someone found
                                    this item after it was left behind.
                                </>
                            ) : (
                                <>
                                    This is a <b className="text-foreground">lost item</b>. Someone reported
                                    this item missing and needs help finding it.
                                </>
                            )}
                        </p>

                        <button
                            onClick={() => setOpen(false)}
                            className="border-buzz-blue/30 border rounded py-0.5 pl-1.5 pr-2.5 -mr-0.5 -mb-0.5 ml-auto mt-3 text-sm font-medium text-buzz-blue/90 flex gap-2 items-center hover:bg-buzz-blue/3"
                        >
                            <LuCheck /> Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

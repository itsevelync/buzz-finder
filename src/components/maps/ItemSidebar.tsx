"use client";

import { useSelectedPin } from "@/context/PinContext";
import { PlainItem } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import SidebarSearchFilters from "./SidebarSearchFilters";
import { useIsMobile } from "@/hooks/IsMobile";

interface ItemSidebarProps {
    items: PlainItem[];
    setFilteredItems: (items: PlainItem[]) => void;
    height: number;
    setHeight: Dispatch<SetStateAction<number>>;
}

export default function ItemSidebar({
    items,
    setFilteredItems,
    height,
    setHeight,
}: ItemSidebarProps) {
    // Desktop formatting
    const [collapsed, setCollapsed] = useState(false);
    const [width, setWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    // Mobile formatting
    const isMobile = useIsMobile(640);
    const [dragging, setDragging] = useState(false);
    const lastY = useRef(0);
    const lastTime = useRef(0);
    const velocity = useRef(0);
    const [vh, setVh] = useState(0);
    const SNAP = {
        COLLAPSED: 85,
        FULL: vh * 0.85 - 55,
    };
    const didDrag = useRef(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);

    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [displayItems, setDisplayItems] = useState<PlainItem[]>(items);

    const { setSelectedId } = useSelectedPin();

    function handleSidebarResize(e: React.PointerEvent<HTMLDivElement>) {
        if (!sidebarRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        sidebarRef.current.setPointerCapture(e.pointerId);

        const startX = e.clientX;
        const startWidth = width;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.min(
                Math.max(startWidth + delta, 200),
                window.innerWidth * 0.9,
            );
            if (sidebarRef.current)
                sidebarRef.current.style.width = `${newWidth}px`;
            setWidth(newWidth);
        };

        function handlePointerUp() {
            setIsResizing(false);
            sidebarRef.current?.releasePointerCapture(e.pointerId);
            sidebarRef.current?.removeEventListener(
                "pointermove",
                handlePointerMove,
            );
            sidebarRef.current?.removeEventListener(
                "pointerup",
                handlePointerUp,
            );
        }

        sidebarRef.current.addEventListener("pointermove", handlePointerMove);
        sidebarRef.current.addEventListener("pointerup", handlePointerUp);
    }

    // Mobile functions
    useEffect(() => {
        setVh(window.innerHeight);
    }, []);

    function handleSheetDragStart(e: React.PointerEvent<HTMLDivElement>) {
        const el = sheetRef.current;
        if (!el) return;

        setDragging(true);

        el.setPointerCapture(e.pointerId);

        const startY = e.clientY;
        const startHeight = height;

        lastY.current = e.clientY;
        lastTime.current = performance.now();

        const onMove = (ev: PointerEvent) => {
            didDrag.current = true;
            const now = performance.now();
            const dy = ev.clientY - lastY.current;
            const dt = now - lastTime.current;

            velocity.current = dy / dt;

            lastY.current = ev.clientY;
            lastTime.current = now;

            const delta = startY - ev.clientY;

            const newHeight = Math.min(
                Math.max(startHeight + delta, SNAP.COLLAPSED),
                SNAP.FULL,
            );

            setHeight(newHeight);
        };

        const onUp = () => {
            setTimeout(() => {
                didDrag.current = false;
            }, 0);
            setDragging(false);

            el.releasePointerCapture(e.pointerId);

            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerup", onUp);

            // 🔥 FLING + SNAP LOGIC
            const v = velocity.current;

            let target = height;

            const isFastSwipe = Math.abs(v) > 0.5;

            if (isFastSwipe) {
                if (v < 0) {
                    target = SNAP.FULL; // swipe up fast
                } else {
                    target = SNAP.COLLAPSED; // swipe down fast
                }
            } else {
                // nearest snap point
                const points = [SNAP.COLLAPSED, SNAP.FULL];
                target = points.reduce((prev, curr) =>
                    Math.abs(curr - height) < Math.abs(prev - height)
                        ? curr
                        : prev,
                );
            }

            setHeight(target);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerup", onUp);
    }

    useEffect(() => {
        const handleResize = () => {
            if (isMobile) {
                setWidth(window.innerWidth);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile]);

    if (!isMobile) {
        return (
            <div className="hidden sm:flex h-full items-center">
                <div
                    ref={sidebarRef}
                    className={`h-full flex flex-col overflow-hidden border-r border-gray-300 bg-white max-w-[90vw] ${
                        isResizing ? "" : "transition-all duration-200"
                    }`}
                    style={{ width: collapsed ? 0 : width }}
                >
                    {/* Search & Filter Header Container */}
                    <SidebarSearchFilters
                        items={items}
                        setFilteredItems={setFilteredItems}
                        width={width}
                        displayItems={displayItems}
                        setDisplayItems={setDisplayItems}
                    />

                    {/* Grid of item cards */}
                    <div
                        className={`grow grid ${
                            width > 1000
                                ? "grid-cols-4"
                                : width > 800
                                  ? "grid-cols-3"
                                  : width > 500
                                    ? "grid-cols-2"
                                    : "grid-cols-1"
                        } gap-3 p-5 overflow-y-auto`}
                    >
                        {displayItems.map((item) => (
                            <div
                                key={item._id.toString()}
                                className="cursor-pointer"
                                onClick={() => {
                                    setSelectedId(item._id.toString());
                                }}
                            >
                                <FoundItemCard
                                    item={item}
                                    includeMapLink={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resize handler */}
                <div
                    className="h-full w-2 -ml-2 -mr-2 px-2 z-100 cursor-col-resize flex items-center justify-center"
                    onPointerDown={handleSidebarResize}
                >
                    <div className="h-full border-r border-gray-300"></div>
                </div>

                {/* Collapse/Expand button */}
                <div
                    onClick={() => {
                        if (collapsed) {
                            setWidth(320);
                            setCollapsed(false);
                        } else {
                            setWidth(0);
                            setCollapsed(true);
                        }
                    }}
                    className="flex items-center justify-center hover:brightness-97 transition-all text-gray-500 cursor-pointer -mr-3 z-100 w-3 h-15 rounded-r border-y border-r border-gray-300 bg-white"
                >
                    {collapsed ? <FaCaretRight /> : <FaCaretLeft />}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col bg-white border-t border-gray-300 rounded-t-2xl shadow-xl"
            style={{
                height,
                touchAction: "none",
                transition: dragging ? "none" : "height 0.25s ease-out",
            }}
        >
            {/* Drag handle */}
            <div
                onPointerDown={handleSheetDragStart}
                className="h-3 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0"
            >
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div
                onClick={() => {
                    if (didDrag.current) return; // ignore clicks after drag
                    setHeight(SNAP.FULL);
                }}
            >
                {/* Header (filters/search) */}
                <SidebarSearchFilters
                    items={items}
                    setFilteredItems={setFilteredItems}
                    width={window.innerWidth}
                    displayItems={displayItems}
                    setDisplayItems={setDisplayItems}
                />
            </div>

            {/* Scrollable content */}
            <div
                onClick={() => {
                    if (didDrag.current) return; // ignore clicks after drag
                    setHeight(SNAP.COLLAPSED);
                }}
                className={`flex-1 overflow-y-auto grid gap-3 p-4 ${
                    width > 500 ? "grid-cols-2" : "grid-cols-1"
                }`}
            >
                {displayItems.map((item) => (
                    <div
                        key={item._id.toString()}
                        onClick={() => setSelectedId(item._id.toString())}
                    >
                        <FoundItemCard item={item} includeMapLink={false} />
                    </div>
                ))}
            </div>
        </div>
    );
}

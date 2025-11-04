"use client";

import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import { Item } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";
import SearchBar from "../ui/SearchBar";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useState, useRef } from "react";

export default function ItemSidebar({
    items,
    filteredItems,
    setFilteredItems,
}: {
    items: Item[];
    filteredItems: Item[];
    setFilteredItems: (items: Item[]) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [width, setWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    const sidebarRef = useRef<HTMLDivElement | null>(null);

    const { setLocation } = useLocation();
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
                window.innerWidth * 0.9
            );

            // Direct DOM update for smooth dragging
            if (sidebarRef.current)
                sidebarRef.current.style.width = `${newWidth}px`;
            setWidth(newWidth);
        };

        function handlePointerUp() {
            setIsResizing(false);

            sidebarRef.current?.releasePointerCapture(e.pointerId);

            sidebarRef.current?.removeEventListener(
                "pointermove",
                handlePointerMove
            );
            sidebarRef.current?.removeEventListener(
                "pointerup",
                handlePointerUp
            );
        }

        sidebarRef.current.addEventListener("pointermove", handlePointerMove);
        sidebarRef.current.addEventListener("pointerup", handlePointerUp);
    }

    return (
        <div className="flex h-full items-center">
            <div
                ref={sidebarRef}
                className={`h-full flex flex-col overflow-hidden border-r border-gray-300 bg-white max-w-[90vw] ${
                    isResizing ? "" : "transition-all duration-200"
                }`}
                style={{ width: collapsed ? 0 : width }}
            >
                {/* Search bar */}
                <div className="p-5 shadow top-0 sticky bg-white">
                    <SearchBar<Item>
                        placeholder="Search items"
                        items={items}
                        setFilteredItems={setFilteredItems}
                        searchableFields={[
                            "title",
                            "item_description",
                            "retrieval_description",
                            "category",
                            "location_details",
                        ]}
                    />
                </div>

                {/* Grid of item cards */}
                <div
                    className={`grow grid 
                    ${
                        width > 1000
                            ? "grid-cols-4"
                            : width > 800
                            ? "grid-cols-3"
                            : width > 500
                            ? "grid-cols-2"
                            : "grid-cols-1"
                    } gap-3 p-5 overflow-y-auto`}
                >
                    {filteredItems.map((item) => (
                        <div
                            key={item._id.toString()}
                            className="cursor-pointer"
                            onClick={() => {
                                if (item.position) setLocation(item.position);
                                setSelectedId(item._id.toString());
                            }}
                        >
                            <FoundItemCard
                                key={item._id.toString()}
                                item={item}
                                includeMapLink={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Resize handler */}
            <div
                className={`h-full w-2 -ml-2 -mr-2 px-2 z-100 cursor-col-resize flex items-center justify-center`}
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

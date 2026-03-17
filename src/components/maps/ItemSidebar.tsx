"use client";

import { useSelectedPin } from "@/context/PinContext";
import { PlainItem } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";
import SearchBar from "../ui/SearchBar";
import { FaCaretLeft, FaCaretRight, FaChevronDown } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { categories } from "@/constants/Categories";

type DateSort = "newest" | "oldest" | null;

export default function ItemSidebar({
    items,
    setFilteredItems,
}: {
    items: PlainItem[];
    setFilteredItems: (items: PlainItem[]) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [width, setWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const [dateSort, setDateSort] = useState<DateSort>("newest");
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [categoryOpen, setCategoryOpen] = useState(false);

    // Tracks search-filtered results as input for category filtering
    const searchFilteredRef = useRef<PlainItem[]>(items);
    // Tracks category-filtered results (what the map shows) for sort-only updates
    const mapItemsRef = useRef<PlainItem[]>(items);

    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // displayItems is what the sidebar list renders (sorted)
    const [displayItems, setDisplayItems] = useState<PlainItem[]>(items);

    const { setSelectedId } = useSelectedPin();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
                setCategoryOpen(false);
            }
        }
        if (categoryOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [categoryOpen]);

    function sortItems(source: PlainItem[], sort: DateSort): PlainItem[] {
        const sorted = [...source];
        if (sort === "newest") {
            sorted.sort((a, b) => new Date(b.lostdate as string | Date).getTime() - new Date(a.lostdate as string | Date).getTime());
        } else if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.lostdate as string | Date).getTime() - new Date(b.lostdate as string | Date).getTime());
        }
        return sorted;
    }

    // Called when search or category changes — updates both map and list
    function applyFilters(source: PlainItem[], sort: DateSort, cats: string[]) {
        let result = [...source];
        if (cats.length > 0) result = result.filter((i) => cats.includes(i.category as string));
        mapItemsRef.current = result;
        setFilteredItems(result);
        setDisplayItems(sortItems(result, sort));
    }

    function handleSearchFilter(searched: PlainItem[]) {
        searchFilteredRef.current = searched;
        applyFilters(searched, dateSort, categoryFilter);
    }

    // Sort only affects the sidebar list, not the map
    function handleDateSort(sort: DateSort) {
        setDateSort(sort);
        setDisplayItems(sortItems(mapItemsRef.current, sort));
    }

    function handleCategoryToggle(key: string) {
        const next = categoryFilter.includes(key)
            ? categoryFilter.filter((k) => k !== key)
            : [...categoryFilter, key];
        setCategoryFilter(next);
        applyFilters(searchFilteredRef.current, dateSort, next);
    }

    function handleSelectAll() {
        setCategoryFilter([]);
        setCategoryOpen(false);
        applyFilters(searchFilteredRef.current, dateSort, []);
    }

    const categoryLabel =
        categoryFilter.length === 0
            ? "All Categories"
            : categoryFilter.length === 1
            ? categories[categoryFilter[0] as keyof typeof categories]?.label
            : `${categoryFilter.length} Categories`;

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
                {/* Search Filter */}
                <div className="p-4 shadow top-0 sticky bg-white space-y-3 relative">
                    <SearchBar<PlainItem>
                        placeholder="Search items"
                        items={items}
                        setFilteredItems={handleSearchFilter}
                        searchableFields={[
                            "title",
                            "item_description",
                            "retrieval_description",
                            "category",
                            "location_details",
                        ]}
                    />

                    {/* Sort by Date (newest first and oldest first) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Sort by Date</label>
                        <select
                            value={dateSort ?? "newest"}
                            onChange={(e) => handleDateSort(e.target.value as DateSort)}
                            className="w-full h-9 text-sm py-1.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-buzz-gold/20 focus:border-buzz-gold/20 flex items-center justify-between"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {/* Filter by Categories */}
                    <div className="flex flex-col gap-1" ref={categoryDropdownRef}>
                        <label className="text-xs font-medium text-gray-500">Filter by Categories</label>
                        <button
                            type="button"
                            onClick={() => setCategoryOpen((o) => !o)}
                            className="w-full h-9 text-sm py-1.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-buzz-gold/20 focus:border-buzz-gold/20 flex items-center justify-between"
                        >
                            <span className={categoryFilter.length === 0 ? "text-gray-400" : "text-gray-700"}>
                                {categoryLabel}
                            </span>
                            <FaChevronDown
                                size={11}
                                className={`text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        {categoryOpen && (
                            <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                {/* All option */}
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                                        categoryFilter.length === 0 ? "font-medium text-gray-800" : "text-gray-600"
                                    }`}
                                >
                                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                        categoryFilter.length === 0 ? "bg-gray-700 border-gray-700" : "border-gray-300"
                                    }`}>
                                        {categoryFilter.length === 0 && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                            </svg>
                                        )}
                                    </span>
                                    All Categories
                                </button>
                                <div className="border-t border-gray-100" />
                                {Object.entries(categories).map(([key, cat]) => {
                                    const checked = categoryFilter.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleCategoryToggle(key)}
                                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                        >
                                            <span
                                                className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                                                style={checked ? { backgroundColor: cat.color, borderColor: cat.color } : { borderColor: "#d1d5db" }}
                                            >
                                                {checked && (
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                    </svg>
                                                )}
                                            </span>
                                            <span style={checked ? { color: cat.color, fontWeight: 500 } : {}}>{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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
                    {displayItems.map((item) => (
                        <div
                            key={item._id.toString()}
                            className="cursor-pointer"
                            onClick={() => {
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

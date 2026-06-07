"use client";

import { PlainItem } from "@/model/Item";
import SearchBar from "../ui/SearchBar";
import { FaSlidersH } from "react-icons/fa";
import {
    useState,
    useRef,
    useEffect,
    useCallback,
    Dispatch,
    SetStateAction,
} from "react";
import { categories } from "@/constants/Categories";
import { statuses, STATUS_KEYS, StatusFilter } from "@/constants/Statuses";

type DateSort = "newest" | "oldest";
type DateRange = "all" | "24h" | "7d" | "30d";

interface SidebarSearchFiltersProps {
    items: PlainItem[];
    setFilteredItems: (items: PlainItem[]) => void;
    width: number;
    displayItems: PlainItem[];
    setDisplayItems: Dispatch<SetStateAction<PlainItem[]>>;
    currentPosition: {
        lat: number;
        lng: number;
    } | null;
}

export default function SidebarSearchFilters({
    items,
    setFilteredItems,
    width,
    displayItems,
    setDisplayItems,
    currentPosition,
}: SidebarSearchFiltersProps) {
    const [dateSort, setDateSort] = useState<DateSort>("newest");
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [distanceFilter, setDistanceFilter] = useState<number | "all">("all");

    // Toggle state for filters visibility
    const [showFilters, setShowFilters] = useState(false);

    const [searchFilteredItems, setSearchFilteredItems] =
        useState<PlainItem[]>(items);
    const mapItemsRef = useRef<PlainItem[]>(items);

    // Calculate count of active filters to show a badge on the toggle button
    const activeFiltersCount =
        categoryFilter.length +
        (dateRange !== "all" ? 1 : 0) +
        (statusFilter !== "all" ? 1 : 0) +
        (distanceFilter !== "all" ? 1 : 0);

    const sortItems = useCallback(
        (source: PlainItem[], sort: DateSort): PlainItem[] => {
            const sorted = [...source];
            if (sort === "newest") {
                sorted.sort(
                    (a, b) =>
                        new Date(b.lostdate as string | Date).getTime() -
                        new Date(a.lostdate as string | Date).getTime(),
                );
            } else if (sort === "oldest") {
                sorted.sort(
                    (a, b) =>
                        new Date(a.lostdate as string | Date).getTime() -
                        new Date(b.lostdate as string | Date).getTime(),
                );
            }
            return sorted;
        },
        [],
    );

    const applyFilters = useCallback(
        (
            source: PlainItem[],
            sort: DateSort,
            cats: string[],
            range: DateRange,
            status: StatusFilter,
            distance: number | "all",
            userPos: { lat: number; lng: number } | null,
        ) => {
            let result = [...source];

            if (cats.length > 0) {
                result = result.filter((i) =>
                    cats.includes(i.category as string),
                );
            }

            if (range !== "all") {
                const now = Date.now();
                const limits = { "24h": 1, "7d": 7, "30d": 30 };
                const days = limits[range];

                result = result.filter((item) => {
                    const itemDate = new Date(
                        item.lostdate as string | Date,
                    ).getTime();
                    const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
                    return diffDays <= days;
                });
            }

            if (status !== "all") {
                result = result.filter((item) => item.status === status);
            }

            // Distance Filter
            if (distance !== "all" && userPos) {
                result = result.filter((item) => {
                    const itemLat = item.position?.lat;
                    const itemLng = item.position?.lng;

                    if (itemLat === undefined || itemLng === undefined)
                        return false;

                    const km = getDistance(
                        userPos.lat,
                        userPos.lng,
                        itemLat,
                        itemLng,
                    );
                    return km <= distance;
                });
            }

            mapItemsRef.current = result;
            setFilteredItems(result);
            setDisplayItems(sortItems(result, sort));
        },
        [setDisplayItems, setFilteredItems, sortItems],
    );

    function handleDateSort(sort: DateSort) {
        setDateSort(sort);
        setDisplayItems(sortItems(mapItemsRef.current, sort));
    }

    function handleCategoryToggle(key: string) {
        const next = categoryFilter.includes(key)
            ? categoryFilter.filter((k) => k !== key)
            : [...categoryFilter, key];
        setCategoryFilter(next);
    }

    useEffect(() => {
        applyFilters(
            searchFilteredItems,
            dateSort,
            categoryFilter,
            dateRange,
            statusFilter,
            distanceFilter,
            currentPosition,
        );
    }, [
        searchFilteredItems,
        dateSort,
        categoryFilter,
        dateRange,
        statusFilter,
        applyFilters,
        distanceFilter,
        currentPosition,
    ]);

    function clearAllFilters() {
        setCategoryFilter([]);
        setDateRange("all");
        setStatusFilter("all");
        setDistanceFilter("all");
    }

    // Haversine formula helper function to calculate distance in kilometers
    const getDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    return (
        <div className="p-4 shadow top-0 sticky bg-white space-y-3 z-10">
            <div
                className={`flex items-center gap-2  ${
                    width > 350 ? "flex-row" : "flex-col"
                }`}
            >
                <div className="w-full">
                    <SearchBar<PlainItem>
                        placeholder="Search items"
                        items={items}
                        setFilteredItems={setSearchFilteredItems}
                        searchableFields={[
                            "title",
                            "item_description",
                            "retrieval_description",
                            "category",
                            "location_details",
                        ]}
                    />
                </div>
                {/* Toggle Button for Expandable Filters */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 h-10 px-3 border rounded-lg transition relative text-sm font-medium ${
                        showFilters || activeFiltersCount > 0
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    } ${width < 350 ? "w-full" : ""}`}
                    title="Toggle Filters"
                >
                    <FaSlidersH />
                    {width < 350 && <span>Filters</span>}
                    {activeFiltersCount > 0 && (
                        <span
                            className={`flex items-center justify-center text-[10px] font-bold w-4 h-4 rounded-full ${showFilters ? "bg-white text-gray-800" : "bg-gray-800 text-white"}`}
                        >
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
                <div className="-mx-4 px-4 pt-2 space-y-4 border-t border-gray-100 max-h-[60vh] overflow-y-auto subtle-scrollbar">
                    {/* Categories */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500">
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setCategoryFilter([])}
                                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                    categoryFilter.length === 0
                                        ? "bg-gray-800 text-white border-gray-800"
                                        : "bg-white text-gray-600 border-gray-300"
                                }`}
                            >
                                All
                            </button>
                            {Object.entries(categories).map(([key, cat]) => {
                                const active = categoryFilter.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            handleCategoryToggle(key)
                                        }
                                        className="px-3 py-1.5 rounded-full text-sm border transition"
                                        style={
                                            active
                                                ? {
                                                      backgroundColor:
                                                          cat.color,
                                                      borderColor: cat.color,
                                                      color: "white",
                                                  }
                                                : {}
                                        }
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500">
                            Date Range
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: "all", label: "All Time" },
                                { value: "24h", label: "24 Hours" },
                                { value: "7d", label: "7 Days" },
                                { value: "30d", label: "30 Days" },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        setDateRange(option.value as DateRange)
                                    }
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                        dateRange === option.value
                                            ? "bg-gray-800 text-white border-gray-800"
                                            : "bg-white text-gray-600 border-gray-300"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500">
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: "all" as const, label: "All" },
                                ...STATUS_KEYS.map((key) => ({
                                    value: key,
                                    label: statuses[key].label,
                                })),
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        setStatusFilter(
                                            option.value as StatusFilter,
                                        )
                                    }
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                        statusFilter === option.value
                                            ? "bg-gray-800 text-white border-gray-800"
                                            : "bg-white text-gray-600 border-gray-300"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distance Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500">
                            Distance Radius
                        </label>

                        {!currentPosition ? (
                            <span className="text-xs text-amber-600 font-medium">
                                📍 Enable location to filter by distance
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: "all", label: "Anywhere" },
                                    { value: 1, label: "Within 1 km" },
                                    { value: 5, label: "Within 5 km" },
                                    { value: 10, label: "Within 10 km" },
                                    { value: 25, label: "Within 25 km" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() =>
                                            setDistanceFilter(
                                                option.value as number | "all",
                                            )
                                        }
                                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                            distanceFilter === option.value
                                                ? "bg-gray-800 text-white border-gray-800"
                                                : "bg-white text-gray-600 border-gray-300"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Option (Kept inside expandable panel to preserve layout) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">
                            Sort By
                        </label>
                        <select
                            value={dateSort}
                            onChange={(e) =>
                                handleDateSort(e.target.value as DateSort)
                            }
                            className="w-full h-9 text-sm px-3 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Active Filters Summary Pills (Always visible if filtering is happening) */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {categoryFilter.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryToggle(cat)}
                            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                        >
                            {categories[cat as keyof typeof categories]?.label}{" "}
                            ×
                        </button>
                    ))}

                    {dateRange !== "all" && (
                        <button
                            onClick={() => setDateRange("all")}
                            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                        >
                            {dateRange} ×
                        </button>
                    )}

                    {statusFilter !== "all" && (
                        <button
                            onClick={() => setStatusFilter("all")}
                            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                        >
                            {
                                statuses[statusFilter as keyof typeof statuses]
                                    ?.label
                            }{" "}
                            ×
                        </button>
                    )}

                    {distanceFilter !== "all" && currentPosition && (
                        <button
                            onClick={() => setDistanceFilter("all")}
                            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                        >
                            Under {distanceFilter}km ×
                        </button>
                    )}

                    <button
                        onClick={clearAllFilters}
                        className="px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs transition font-medium"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Results Count */}
            <div className="text-xs text-gray-400 font-medium pt-1">
                {displayItems.length} item
                {displayItems.length !== 1 ? "s" : ""} found
            </div>
        </div>
    );
}

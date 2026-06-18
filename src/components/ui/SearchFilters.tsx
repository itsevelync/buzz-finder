"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSlidersH } from "react-icons/fa";
import SearchBar from "../ui/SearchBar";
import { categories } from "@/constants/Categories";
import { useUserLocation } from "@/context/UserLocationContext";

type DateSort = "newest" | "oldest";
type DateRange = "all" | "24h" | "7d" | "14d" | "30d";

interface FilterableItem {
    name: string;
    description?: string | null;
    category?: string | null;
    lostDate?: string | Date | null;
    locationDescription?: string | null;
    locationPin?: {
        lat: number;
        lng: number;
    } | null;
    isFound?: boolean;
    status?: string;
    [key: string]: unknown;
}

interface SearchFiltersProps<T> {
    items: T[];
    searchedItems: T[];
    setSearchedItems: (items: T[]) => void;
    setFilteredItems: (items: T[]) => void;
    displayItems: T[];
    setDisplayItems: (items: T[]) => void;
    searchableFields?: (keyof T)[];
    width?: number;
    hideSearchMeta?: boolean;
    searchPlaceholder?: string;
    isLostItemPost?: boolean;
    isMap?: boolean;
}

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function SearchFilters<T extends FilterableItem>({
    items,
    searchedItems,
    setSearchedItems,
    setFilteredItems,
    displayItems,
    setDisplayItems,
    searchableFields = ["name" as keyof T],
    width = 2000,
    hideSearchMeta = false,
    searchPlaceholder = "Search items",
    isLostItemPost = false,
    isMap = false,
}: SearchFiltersProps<T>) {
    const { currentPosition } = useUserLocation();

    // Filter States
    const [dateSort, setDateSort] = useState<DateSort>("newest");
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [distanceFilter, setDistanceFilter] = useState<number | "all">("all");
    const [showFilters, setShowFilters] = useState(false);

    const dateOptions = [
        { value: "all", label: "All Time" },
        { value: "24h", label: "24 Hours" },
        { value: "7d", label: "7 Days" },
        { value: "14d", label: "14 Days" },
    ];

    if (!isMap) {
        dateOptions.push({ value: "30d", label: "30 Days" });
    } else {
        dateOptions[0].label = "All (< 3 weeks)";
    }

    // Conditional Status States
    const [hideResolvedCheckbox, setHideResolvedCheckbox] =
        useState<boolean>(false);

    // Derived State for tracking active filter badges
    const activeFiltersCount = useMemo(() => {
        return (
            categoryFilter.length +
            (dateRange !== "all" ? 1 : 0) +
            (distanceFilter !== "all" ? 1 : 0) +
            (hideResolvedCheckbox ? 1 : 0)
        );
    }, [categoryFilter, dateRange, distanceFilter, hideResolvedCheckbox]);

    useEffect(() => {
        const filtered = searchedItems.filter((item) => {
            // 1. Conditional Status Layer Filtering
            if (hideResolvedCheckbox) {
                if (isLostItemPost && item.isFound) {
                    return false;
                } else if (!isLostItemPost && item.status !== "unclaimed") {
                    return false;
                }
            }

            // 2. Category Filter
            if (
                categoryFilter.length > 0 &&
                (!item.category ||
                    !categoryFilter.includes(item.category as string))
            )
                return false;

            // 3. Date Range Filter
            if (dateRange !== "all") {
                const itemDate = item.lostDate
                    ? new Date(item.lostDate).getTime()
                    : new Date(item.createdAt as string).getTime();
                const diffDays =
                    (Date.now() - itemDate) / (1000 * 60 * 60 * 24);
                const limits = { "24h": 1, "7d": 7, "14d": 14, "30d": 30 };
                if (diffDays > limits[dateRange]) return false;
            }

            // 4. Distance Radius Filter
            if (
                distanceFilter !== "all" &&
                currentPosition &&
                item.locationPin
            ) {
                if (
                    calculateDistance(
                        currentPosition.lat,
                        currentPosition.lng,
                        item.locationPin.lat,
                        item.locationPin.lng,
                    ) > distanceFilter
                ) {
                    return false;
                }
            }
            return true;
        });

        // Sorting
        filtered.sort((itemA, itemB) => {
            const timeA = itemA.lostDate
                ? new Date(itemA.lostDate as string | Date).getTime()
                : 0;
            const timeB = itemB.lostDate
                ? new Date(itemB.lostDate as string | Date).getTime()
                : 0;
            return dateSort === "newest" ? timeB - timeA : timeA - timeB;
        });

        setFilteredItems(filtered);
        setDisplayItems(filtered);
    }, [
        searchedItems,
        dateSort,
        categoryFilter,
        dateRange,
        isLostItemPost,
        hideResolvedCheckbox,
        distanceFilter,
        currentPosition,
        setFilteredItems,
        setDisplayItems,
    ]);

    const handleCategoryToggle = (key: string) => {
        setCategoryFilter((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
    };

    const clearAllFilters = () => {
        setCategoryFilter([]);
        setDateRange("all");
        setDistanceFilter("all");
        setHideResolvedCheckbox(false);
    };

    const isCompact = width < 350;

    return (
        <>
            <div className="p-4">
                <div
                    className={`flex items-center gap-2 ${isCompact ? "flex-col" : "flex-row"}`}
                >
                    <div className="w-full">
                        <SearchBar<T>
                            placeholder={searchPlaceholder}
                            items={items}
                            setFilteredItems={setSearchedItems}
                            searchableFields={searchableFields}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 h-10 px-3 border rounded-lg transition text-sm font-medium ${
                            showFilters || activeFiltersCount > 0
                                ? "bg-gray-800 text-white border-gray-800"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        } ${isCompact ? "w-full" : ""}`}
                    >
                        <FaSlidersH />
                        {activeFiltersCount > 0 && (
                            <span
                                className={`flex items-center justify-center text-[10px] font-bold w-4 h-4 rounded-full ${showFilters ? "bg-white text-gray-800" : "bg-gray-800 text-white"}`}
                            >
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="relative w-full">
                {showFilters && (
                    <div className="absolute w-full top-0 bg-white p-4 space-y-4 border-t border-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto subtle-scrollbar shadow-sm z-10">
                        {/* ================= SHARED FILTER UI CONTROLS ================= */}
                        <FilterSection label="Categories">
                            <button
                                onClick={() => setCategoryFilter([])}
                                className={`px-3 py-1.5 rounded-full text-sm border transition ${categoryFilter.length === 0 ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300"}`}
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
                        </FilterSection>

                        <FilterSection label="Date Range">
                            {dateOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        setDateRange(option.value as DateRange)
                                    }
                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${dateRange === option.value ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300"}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </FilterSection>

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
                                                    option.value as
                                                        | number
                                                        | "all",
                                                )
                                            }
                                            className={`px-3 py-1.5 rounded-full text-sm border transition ${distanceFilter === option.value ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300"}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isMap && (
                            <div className="flex items-center gap-2 py-1">
                                <input
                                    type="checkbox"
                                    id="hideResolvedCheckbox"
                                    checked={hideResolvedCheckbox}
                                    onChange={(e) =>
                                        setHideResolvedCheckbox(
                                            e.target.checked,
                                        )
                                    }
                                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-700 accent-gray-800 cursor-pointer"
                                />
                                <label
                                    htmlFor="hideResolvedCheckbox"
                                    className="text-sm text-gray-700 cursor-pointer select-none"
                                >
                                    {isLostItemPost
                                        ? "Hide items marked as found"
                                        : "Show unclaimed items only"}
                                </label>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">
                                Sort By
                            </label>
                            <select
                                value={dateSort}
                                onChange={(e) =>
                                    setDateSort(e.target.value as DateSort)
                                }
                                className="w-full h-9 text-sm px-3 border border-gray-300 rounded-lg bg-white"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        {isMap && (
                            <p className="text-sm italic text-gray-600">
                                *Only unclaimed items are displayed
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Active Filters Metadata Bottom Summary */}
            {!hideSearchMeta && (
                <div className="px-4 pb-4 space-y-3">
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categoryFilter.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryToggle(cat)}
                                    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                                >
                                    {
                                        categories[
                                            cat as keyof typeof categories
                                        ]?.label
                                    }{" "}
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
                            {!isMap && hideResolvedCheckbox && (
                                <button
                                    onClick={() =>
                                        setHideResolvedCheckbox(false)
                                    }
                                    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition"
                                >
                                    {isLostItemPost ? "Not Found" : "Unclaimed"}{" "}
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
                    <div className="text-xs text-gray-400 font-medium">
                        {displayItems.length} item
                        {displayItems.length !== 1 ? "s" : ""} found
                    </div>
                </div>
            )}
        </>
    );
}

function FilterSection({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500">{label}</label>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

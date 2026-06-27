"use client";

import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
import { categories as CATEGORIES_DATA } from "@/constants/Categories";
import {
    LuBell,
    LuBellOff,
    LuPencil,
    LuRotateCcw,
    LuChevronDown,
} from "react-icons/lu";
import { useUserLocation } from "@/context/UserLocationContext";

interface AlertDataType {
    query: string;
    categories: string[];
    maxDistance: number | null;
    locationPin: { lat: number; lng: number } | null | undefined;
    linkedLostItem: string | null;
}

interface LostItemSearchAlertProps {
    alertEnabled: boolean;
    setAlertEnabled: Dispatch<SetStateAction<boolean>>;
    useDefaultAlert: boolean;
    setUseDefaultAlert: Dispatch<SetStateAction<boolean>>;
    formItemName: string;
    formCategory: string;
    formLocationPin: { lat: number; lng: number } | null;
    lostItemId: string | null;
    alertPayload: AlertDataType;
    setAlertPayload: Dispatch<SetStateAction<AlertDataType>>;
}

export default function LostItemSearchAlert({
    alertEnabled: isEnabled,
    setAlertEnabled: setIsEnabled,
    useDefaultAlert,
    setUseDefaultAlert,
    formItemName,
    formCategory,
    formLocationPin,
    lostItemId,
    alertPayload,
    setAlertPayload,
}: LostItemSearchAlertProps) {
    const { currentPosition } = useUserLocation();

    const [locationType, setLocationType] = useState<"pin" | "current">("pin");

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const resolvedLocationType = formLocationPin ? locationType : "current";

    useEffect(() => {
        if (useDefaultAlert) {
            setAlertPayload({
                query: formItemName,
                categories: formCategory ? [formCategory] : ["misc"],
                maxDistance: 1,
                locationPin: formLocationPin ?? currentPosition,
                linkedLostItem: lostItemId,
            });
            setLocationType(formLocationPin ? "pin" : "current");
        }
    }, [
        currentPosition,
        formCategory,
        formItemName,
        formLocationPin,
        lostItemId,
        setAlertPayload,
        setUseDefaultAlert,
        useDefaultAlert,
    ]);

    const handleResetToDefaults = () => {
        setAlertPayload({
            query: formItemName,
            categories: formCategory ? [formCategory] : ["misc"],
            maxDistance: 1,
            locationPin: formLocationPin ?? currentPosition,
            linkedLostItem: lostItemId,
        });
        setLocationType(formLocationPin ? "pin" : "current");
        setUseDefaultAlert(true);
    };

    const toggleCategorySelection = (key: string) => {
        setAlertPayload((prev: AlertDataType) => {
            const categories = prev.categories.includes(key)
                ? prev.categories.filter((k) => k !== key)
                : [...prev.categories, key];

            return {
                ...prev,
                categories,
            };
        });
    };

    const removeCategoryBadge = (e: React.MouseEvent, key: string) => {
        e.stopPropagation(); // Prevents opening the dropdown layout when clicking the badge action
        if (useDefaultAlert) return;

        setAlertPayload((prev) => ({
            ...prev,
            categories: prev.categories.includes(key)
                ? prev.categories.filter((k) => k !== key)
                : [...prev.categories, key],
        }));
    };

    return (
        <div className="bg-white border border-foreground/10 rounded-lg p-5 flex flex-col gap-4 mt-1 transition-all">
            {/* Header / Pill-Shaped Toggle Switch */}
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className={`p-2 rounded-lg ${isEnabled ? "bg-buzz-gold/7 text-buzz-gold" : "bg-foreground/5 text-foreground/50"}`}
                    >
                        {isEnabled ? (
                            <LuBell className="text-xl" />
                        ) : (
                            <LuBellOff className="text-xl" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm sm:text-base">
                            Search Alert
                        </h3>
                        <p className="text-xs text-foreground/60 hidden sm:block">
                            Get notified when a matching found item is reported.
                        </p>
                    </div>
                </div>

                {/* Enable / Disable Toggle Switch */}
                <button
                    type="button"
                    onClick={() => {
                        setIsEnabled(!isEnabled);
                        if (isEnabled) setUseDefaultAlert(true);
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                        isEnabled ? "bg-buzz-blue" : "bg-foreground/20"
                    }`}
                >
                    <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            {/* Configurable Form Blocks */}
            <div
                className={`border-t border-foreground/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${isEnabled ? "opacity-100" : "hidden"}`}
            >
                {/* Field 1: Match Name Query */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                        Search Keyword
                    </label>
                    <input
                        type="text"
                        value={alertPayload.query}
                        onChange={(e) =>
                            setAlertPayload((prev) => ({
                                ...prev,
                                query: e.target.value,
                            }))
                        }
                        disabled={useDefaultAlert}
                        placeholder="No item name provided yet..."
                        className="w-full h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-foreground/2 disabled:text-foreground/70 disabled:cursor-not-allowed focus:outline-none"
                    />
                </div>

                {/* Field 2: Categories Multiselect with Badges & Arrows */}
                <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                        Categories
                    </label>
                    <div
                        onClick={() =>
                            !useDefaultAlert &&
                            setShowCategoryDropdown(!showCategoryDropdown)
                        }
                        className={`min-h-10 pl-3 pr-10 py-1.5 border border-foreground/10 rounded-lg text-sm bg-foreground/2 flex flex-wrap gap-1 items-center relative ${!useDefaultAlert ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                        {!alertPayload.categories ||
                            (alertPayload.categories.length === 0 && (
                                <span className="text-foreground/50">
                                    Select categories...
                                </span>
                            ))}
                        {alertPayload.categories &&
                            alertPayload.categories.map((catKey) => {
                                const match =
                                    CATEGORIES_DATA[
                                        catKey as keyof typeof CATEGORIES_DATA
                                    ];
                                return (
                                    <span
                                        key={catKey}
                                        className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 text-xs rounded-full font-medium group"
                                        style={{
                                            color: match?.color || "#6B7280",
                                            backgroundColor:
                                                match?.color + "20" ||
                                                "#6B728020",
                                        }}
                                    >
                                        <span>{match?.label || catKey}</span>
                                        {!useDefaultAlert && (
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    removeCategoryBadge(
                                                        e,
                                                        catKey,
                                                    )
                                                }
                                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-80 hover:bg-foreground/5 text-xs font-bold font-sans transition-all"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                        {/* Down arrow icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
                            <LuChevronDown size={16} />
                        </div>
                    </div>

                    {showCategoryDropdown && !useDefaultAlert && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowCategoryDropdown(false)}
                            />
                            <div className="absolute top-16 left-0 w-full bg-white border border-foreground/10 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 p-1">
                                {Object.entries(CATEGORIES_DATA).map(
                                    ([key, value]) => {
                                        const isChecked =
                                            alertPayload.categories.includes(
                                                key,
                                            );
                                        return (
                                            <button
                                                type="button"
                                                key={key}
                                                onClick={() =>
                                                    toggleCategorySelection(key)
                                                }
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/2 rounded-md flex items-center gap-3"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    readOnly
                                                    className="w-4 h-4 rounded border-foreground/50 text-buzz-blue focus:ring-0 cursor-pointer pointer-events-none accent-buzz-blue"
                                                />
                                                <span>{value.label}</span>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Field 3 & 4 Combined: Side-by-Side Sentence Dropdowns */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                        Search Radius
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        {/* Radius Dropdown (Left side) */}
                        <div className="relative w-full sm:w-auto flex-1">
                            <select
                                value={alertPayload.maxDistance ?? "all"}
                                onChange={(e) =>
                                    setAlertPayload((prev) => ({
                                        ...prev,
                                        maxDistance:
                                            e.target.value === "all"
                                                ? null
                                                : Number(e.target.value),
                                    }))
                                }
                                disabled={useDefaultAlert}
                                className="w-full h-10 pl-3 pr-8 border border-foreground/10 rounded-lg text-sm bg-foreground/2 disabled:text-foreground/70 disabled:cursor-not-allowed focus:outline-none appearance-none"
                            >
                                <option value={1}>Within 1 km</option>
                                <option value={5}>Within 5 km</option>
                                <option value={10}>Within 10 km</option>
                                <option value={25}>Within 25 km</option>
                                <option value="all">Anywhere</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
                                <LuChevronDown size={16} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                            {/* Mid-Sentence Spacer label */}
                            <span className="text-sm text-foreground/50 select-none px-1">
                                of
                            </span>

                            {/* Base Location Target (Right side) */}
                            <div className="relative w-full sm:w-auto flex-1">
                                <select
                                    value={resolvedLocationType}
                                    onChange={(e) =>
                                        setLocationType(
                                            e.target.value as "pin" | "current",
                                        )
                                    }
                                    disabled={
                                        useDefaultAlert || !formLocationPin
                                    }
                                    className="w-full h-10 pl-3 pr-8 border border-foreground/10 rounded-lg text-sm bg-foreground/2 disabled:text-foreground/70 disabled:cursor-not-allowed focus:outline-none appearance-none"
                                >
                                    {formLocationPin && (
                                        <option value="pin">
                                            pinned map location
                                        </option>
                                    )}
                                    <option value="current">
                                        my current position
                                    </option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
                                    <LuChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action State Triggers (Edit / Reset Control Strip) */}
            {isEnabled && (
                <div className="flex items-center justify-end gap-2 text-xs border-t border-foreground/10 pt-2">
                    {!useDefaultAlert ? (
                        <>
                            <button
                                type="button"
                                onClick={handleResetToDefaults}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-foreground/70 hover:bg-foreground/5 rounded-md"
                            >
                                <LuRotateCcw size={13} /> Reset Defaults
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setUseDefaultAlert(false)}
                            className="flex items-center gap-1 px-3 py-1.5 text-buzz-blue hover:bg-buzz-blue/3 font-medium rounded-md border border-buzz-blue/20"
                        >
                            <LuPencil size={13} /> Customize Search Alert
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

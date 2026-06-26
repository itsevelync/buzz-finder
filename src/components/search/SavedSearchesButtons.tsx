"use client";

import { useModal } from "@/context/ModalContext";
import SavedSearchesModal from "./SavedSearchesModal";
import { FaRegBell } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useUserLocation } from "@/context/UserLocationContext";
import { toast } from "react-toastify";
import { LuStar } from "react-icons/lu";
import { SavedSearchItem } from "@/model/SavedSearch";

interface SavedSearchesButtonsProps {
    activeSearch: boolean;
    savedSearchTerm: string;
    categoryFilter: string[];
    distanceFilter: number | "all";
}

export default function SavedSearchesButtons({
    activeSearch,
    savedSearchTerm,
    categoryFilter,
    distanceFilter,
}: SavedSearchesButtonsProps) {
    const { openModal } = useModal();
    const { currentPosition } = useUserLocation();

    const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
    const [loadingSavedSearches, setLoadingSavedSearches] =
        useState<boolean>(true);
    const [savedSearchesFetchError, setSaveSearchesFetchError] = useState("");

    const [searchSaved, setSearchSaved] = useState(false);

    // Inside your SearchFilters component function:
    const handleSaveSearch = async () => {
        try {
            const response = await fetch("/api/saved-searches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: savedSearchTerm,
                    categories: categoryFilter,
                    maxDistance:
                        distanceFilter !== "all" ? distanceFilter : null,
                    locationPin: currentPosition
                        ? { lat: currentPosition.lat, lng: currentPosition.lng }
                        : null,
                }),
            });

            if (response.ok) {
                toast.success(
                    "Search saved! You'll receive notifications for matching items.",
                );

                const newSavedSearch = await response.json();

                setSavedSearches((prev) => [newSavedSearch, ...prev]);
                setSearchSaved(true);

                setTimeout(() => {
                    setSearchSaved(false);
                }, 2000);
            } else {
                const errData = await response.json();
                toast.error(
                    `Failed to save search: ${errData.error || "Server issue"}`,
                );
            }
        } catch {
            toast.error("Failed to save search.");
        }
    };

    // Fetch user's saved searches
    useEffect(() => {
        async function fetchSearches() {
            try {
                const res = await fetch("/api/saved-searches");
                if (!res.ok) throw new Error("Failed to load saved searches.");
                const data = await res.json();
                console.log(data);
                setSavedSearches(data);
            } catch (err) {
                setSaveSearchesFetchError(
                    err instanceof Error ? err.message : "An error occurred.",
                );
            } finally {
                setLoadingSavedSearches(false);
            }
        }
        fetchSearches();
    }, []);

    const handleOpen = () => {
        openModal(
            <SavedSearchesModal
                searches={savedSearches}
                setSearches={setSavedSearches}
                error={savedSearchesFetchError}
                loading={loadingSavedSearches}
            />,
            {
                maxWidth: "xl",
            },
        );
    };

    return (
        <>
            {activeSearch && (
                <button
                    className="shadow bg-buzz-gold/1 hover:bg-buzz-gold/6 text-xs text-foreground/90 border rounded-full py-1 px-2 border-buzz-gold/40 flex items-center gap-1.5"
                    onClick={handleSaveSearch}
                >
                    <LuStar className="text-buzz-gold" />{" "}
                    {searchSaved
                        ? "Search Alert Created!"
                        : "Create Search Alert"}
                </button>
            )}
            {savedSearches && savedSearches.length > 0 && (
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 px-2 py-1 border border-buzz-blue/30 rounded-full text-xs text-buzz-blue/90 bg-white hover:bg-buzz-blue/3 transition shadow-sm"
                >
                    <FaRegBell className="text-buzz-blue/70" />
                    <span>Manage Alerts</span>
                </button>
            )}
        </>
    );
}

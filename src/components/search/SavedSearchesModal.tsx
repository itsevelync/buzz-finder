"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { categories } from "@/constants/Categories";
import { toast } from "react-toastify";
import { LuMapPin, LuStar, LuTrash2, LuX } from "react-icons/lu";
import { useModal } from "@/context/ModalContext";
import { SavedSearchItem } from "@/model/SavedSearch";

interface SavedSearchesModalProps {
    searches: SavedSearchItem[];
    setSearches: Dispatch<SetStateAction<SavedSearchItem[]>>;
    loading: boolean;
    error: string;
}

export default function SavedSearchesModal({
    searches,
    setSearches,
    loading,
    error,
}: SavedSearchesModalProps) {
    const { closeModal } = useModal();

    // Modal does re-mount when searches parameter changes
    // This variable ensures the UI remains up-to-date
    const [modalSearches, setModalSearches] = useState(searches);

    // Delete a saved search
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this saved search?"))
            return;

        try {
            const res = await fetch(`/api/saved-searches/${id}`, {
                method: "DELETE",
            });
            const body = await res.json();
            if (res.ok) {
                toast.success("Search alert deleted successfully.");
                setSearches((prev) => prev.filter((item) => item._id !== id));
            } else {
                toast.error(body.error);
            }

            setModalSearches((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Could not delete search alert.",
            );
        }
    };
    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    <LuStar className="text-buzz-gold" /> Saved Searches
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>
            <p className="text-foreground/75 mb-4">
                You will be notified when new items match these searches.
            </p>

            {loading || error || searches.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {loading ? (
                        <>Loading saved searches...</>
                    ) : error ? (
                        <>{error}</>
                    ) : (
                        <>You haven&rsquo;t saved any searches yet.</>
                    )}
                </div>
            ) : (
                <div className="space-y-3 max-h-[calc(80vh-150px)] overflow-y-auto subtle-scrollbar p-1">
                    {modalSearches.map((search) => (
                        <div
                            key={search._id}
                            className="flex items-center justify-between p-3.5 bg-background border border-foreground/5 rounded-md shadow-sm hover:border-foreground/9 transition-all"
                        >
                            <div className="flex flex-col gap-2.5 flex-1 min-w-0 pr-3">
                                {/* Search query term if it exists */}
                                {search.query ? (
                                    <span className="font-medium truncate">
                                        &ldquo;{search.query}&rdquo;
                                    </span>
                                ) : (
                                    <span className="text-sm text-foreground/50 italic">
                                        No keyword specified
                                    </span>
                                )}

                                {/* Filter Criteria Badges */}
                                {search.categories &&
                                    search.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {/* Categories */}
                                            {search.categories.map((catKey) => {
                                                const cat =
                                                    categories[
                                                        catKey as keyof typeof categories
                                                    ];
                                                return (
                                                    <span
                                                        key={catKey}
                                                        className="text-xs px-2 py-0.5 font-medium rounded-full text-background"
                                                        style={{
                                                            border: `1px solid ${cat.color}30`,
                                                            color: cat.color,
                                                            backgroundColor:
                                                                cat.color +
                                                                "15",
                                                        }}
                                                    >
                                                        {cat?.label || catKey}
                                                    </span>
                                                );
                                            })}

                                            {/* Distance */}
                                            {search.maxDistance && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 font-medium bg-buzz-blue/3 text-buzz-blue border border-buzz-blue/5 rounded-full">
                                                    <LuMapPin size={8} />
                                                    Within {search.maxDistance}
                                                    km
                                                </span>
                                            )}
                                        </div>
                                    )}
                            </div>

                            {/* Delete Trigger Button */}
                            <button
                                onClick={() => handleDelete(search._id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete saved search"
                            >
                                <LuTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

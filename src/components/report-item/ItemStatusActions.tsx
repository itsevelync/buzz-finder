"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHandPaper, FaTimesCircle } from "react-icons/fa";
import { statuses, ItemStatus } from "@/constants/Statuses";

interface ItemStatusActionsProps {
    itemId: string;
    currentStatus?: string;
}

export default function ItemStatusActions({ itemId, currentStatus }: ItemStatusActionsProps) {
    const [activeModal, setActiveModal] = useState<ItemStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdateStatus = async (newStatus: ItemStatus) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/item/${itemId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setActiveModal(null);
                router.refresh(); // Reloads the server data seamlessly
            } else {
                alert("Failed to update item status. Please try again.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setLoading(false);
        }
    };

    // If the item is already wrapped up, don't show active action options
    if (currentStatus === "claimed" || currentStatus === "gone") {
        return (
            <div className="w-full text-center p-3 rounded-lg bg-gray-100 border text-gray-500 font-medium text-sm">
                This item is marked as <span className="font-bold uppercase">{statuses[currentStatus].label}</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2 items-center">
            {/* Action Buttons */}
            <button
                onClick={() => setActiveModal("claimed")}
                className="w-full bg-buzz-gold flex items-center justify-center gap-2 text-white text-xl px-6 shadow-md hover:brightness-110 hover:shadow filter hover:saturate-180 hover:translate-y-0.5 shadow-buzz-gold/50 py-1.5 rounded-full transition"
            >
                <FaHandPaper /> Claim Item
            </button>
            
            <button 
                onClick={() => setActiveModal("gone")}
                className="underline opacity-80 hover:opacity-100 transition text-sm text-gray-600 cursor-pointer"
            >
                Item no longer there?
            </button>

            {/* Backdrop Layer */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-10000 animate-fade-in">
                    
                    {/* MODAL: Claim Item */}
                    {activeModal === "claimed" && (
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-gray-100">
                            <div className="flex items-center gap-3 text-buzz-gold text-2xl font-bold">
                                <FaHandPaper />
                                <h2>Claim Item Confirmation</h2>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                You are marking this item as <strong>claimed</strong>. Use this option only if you are the rightful owner who has recovered it, or if you have personally coordinated returning it safely. 
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                                This will archive the item listing so other app users don&apos;t keep searching for it.
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("claimed")}
                                    disabled={loading}
                                    className="px-4 py-2 bg-buzz-gold text-white rounded-xl text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Yes, Claimed"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODAL: No Longer There */}
                    {activeModal === "gone" && (
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-gray-100">
                            <div className="flex items-center gap-3 text-red-600 text-2xl font-bold">
                                <FaTimesCircle />
                                <h2>Report Missing Item</h2>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Are you at this physical location right now and unable to find the item? 
                            </p>
                            <p className="text-xs text-gray-500">
                                Marking this as <strong>No Longer There</strong> helps save other community members from making an unnecessary journey to look for it.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("gone")}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {loading ? "Reporting..." : "Confirm Gone"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
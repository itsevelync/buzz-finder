"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

interface ResolveModalProps {
    itemId: string;
    itemName: string;
}

export default function ResolveItemModal({ itemId, itemName }: ResolveModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    async function handleConfirmResolve() {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/lost-item-post/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFound: true }),
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                toast.error("Could not update item status. Please try again.");
            }
        } catch (err) {
            console.error("Error setting item resolution flag:", err);
            toast.error("Network error updating post.");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-2.5 rounded shadow-sm transition text-sm flex items-center justify-center gap-2"
            >
                <LuCheck className="text-xs" /> Mark as Found
            </button>

            {/* Modal Portal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 max-w-md w-full p-5 animate-in fade-in zoom-in-95 duration-150 text-sm">
                        <div className="flex items-center justify-between pb-1">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Found Item</h3>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-gray-600 transition"
                                disabled={isUpdating}
                            >
                                <LuX className="text-lg" />
                            </button>
                        </div>
                        
                        <div className="my-4 text-gray-600 space-y-2">
                            <p>
                                Did you find <strong className="text-foreground">{itemName}</strong>? You are changing its status to <strong className="text-foreground">Item Found</strong>.
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 font-medium border border-foreground/20 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmResolve}
                                className="px-4 py-2 font-semibold text-white bg-buzz-blue hover:opacity-90 rounded transition shadow-xs flex items-center gap-1.5"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Processing..." : "Yes, It's Found!"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
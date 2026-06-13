"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHandPaper } from "react-icons/fa";
import { statuses, ItemStatus } from "@/constants/Statuses";
import { toast } from "react-toastify";
import { useModal } from "@/context/ModalContext";
import { LuMapPinCheckInside, LuSearchX, LuX } from "react-icons/lu";

interface ItemStatusActionsProps {
    itemId: string;
    currentStatus: ItemStatus;
}

export default function ItemStatusActions({
    itemId,
    currentStatus,
}: ItemStatusActionsProps) {
    const { openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdateStatus = async (
        newStatus: ItemStatus,
        undoAction: boolean = false,
    ) => {
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
                closeModal();
                router.refresh();

                if (!undoAction) {
                    toast.success(
                        <div className="flex items-center justify-between gap-4 w-full">
                            <span className="flex-1">
                                Item marked as {newStatus.toLowerCase()}!
                            </span>
                            <button
                                onClick={() =>
                                    handleUpdateStatus("unclaimed", true)
                                }
                                className="text-gray-900 px-2.5 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                Undo
                            </button>
                        </div>,
                        {
                            closeOnClick: true,
                        },
                    );
                }
            } else {
                toast.error("Failed to update item status. Please try again.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };
    // If the item is already wrapped up, don't show active action options
    if (currentStatus === "claimed" || currentStatus === "gone") {
        return (
            <>
                <div className="w-full text-center p-3 rounded-lg bg-gray-100 border text-gray-500 font-medium">
                    This item is marked as{" "}
                    <span className="font-bold uppercase">
                        {statuses[currentStatus].label}
                    </span>
                </div>

                <button
                    onClick={() => handleUpdateStatus("unclaimed")}
                    className="-mt-1 underline text-foreground/50 text-sm"
                >
                    Item still there? Mark as unclaimed.
                </button>
            </>
        );
    }

    function handleOpenClaimModal() {
        openModal({
            content: (
                <div className="bg-white rounded-lg w-full p-6 shadow-xl space-y-3 border border-gray-100">
                    <div className="flex justify-between items-start">
                        <h2 className="flex items-center gap-3 text-buzz-gold text-2xl font-bold">
                            <LuMapPinCheckInside /> Confirm Claim Item
                        </h2>
                        <button
                            onClick={closeModal}
                            className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                        >
                            <LuX className="text-lg" />
                        </button>
                    </div>
                    <p className="text-foreground/75">
                        Mark this item as{" "}
                        <strong className="text-foreground">claimed</strong> if
                        it has been safely recovered or returned to its owner.
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={closeModal}
                            disabled={loading}
                            className="px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground/70 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpdateStatus("claimed")}
                            disabled={loading}
                            className="px-4 py-2 bg-buzz-gold text-white rounded-md font-medium hover:brightness-110 transition disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Yes, Mark as Claimed"}
                        </button>
                    </div>
                </div>
            ),
        });
    }

    function handleOpenGoneModal() {
        openModal({
            content: (
                <div className="bg-white rounded-lg w-full p-6 shadow-xl space-y-3 border border-gray-100">
                    <div className="flex justify-between items-start">
                        <h2 className="flex items-center gap-3 text-buzz-blue text-2xl font-bold">
                            <LuSearchX /> Report Missing Item
                        </h2>
                        <button
                            onClick={closeModal}
                            className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                        >
                            <LuX className="text-lg" />
                        </button>
                    </div>
                    <p className="text-foreground/75">
                        Is the item no longer at the specified location?
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={closeModal}
                            disabled={loading}
                            className="px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground/70 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpdateStatus("gone")}
                            disabled={loading}
                            className="px-4 py-2 bg-buzz-blue text-white rounded-md font-medium hover:brightness-130 transition disabled:opacity-50"
                        >
                            {loading ? "Reporting..." : "Confirm Gone"}
                        </button>
                    </div>
                </div>
            ),
        });
    }

    return (
        <div className="w-full flex flex-col gap-2 items-center">
            {/* Action Buttons */}
            <button
                onClick={handleOpenClaimModal}
                className="w-full bg-buzz-gold flex items-center justify-center gap-2 text-white text-xl px-6 shadow-md hover:brightness-110 hover:shadow filter hover:saturate-180 hover:translate-y-0.5 shadow-buzz-gold/50 py-1.5 rounded-full transition"
            >
                <FaHandPaper /> Claim Item
            </button>

            <button
                onClick={handleOpenGoneModal}
                className="underline opacity-80 hover:opacity-100 transition text-sm text-gray-600 cursor-pointer"
            >
                Item no longer there?
            </button>
        </div>
    );
}

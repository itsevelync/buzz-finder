"use client";

import { useState } from "react";
import { FaHandPaper } from "react-icons/fa";
import { statuses, ItemStatus } from "@/constants/Statuses";
import { toast } from "react-toastify";
import { useModal } from "@/context/ModalContext";
import { LuMapPinCheckInside, LuSearchX } from "react-icons/lu";
import ConfirmationModal from "../ui/ConfirmationModal";
import { usePostAndItem } from "@/context/PostAndItemContext";

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
    const { refresh } = usePostAndItem();

    const handleUpdateStatus = async (
        newStatus: ItemStatus,
        undoAction: boolean = false,
    ) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/items/${itemId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                closeModal();
                refresh();

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
        openModal(
            <ConfirmationModal
                title="Confirm Item Claim"
                icon={LuMapPinCheckInside}
                body={
                    <>
                        You are marking this item as <strong>claimed</strong>.
                        Confirm that it has been safely recovered or returned to
                        its owner.
                    </>
                }
                confirmLabel="Yes, Mark Claimed"
                confirmingLabel="Updating..."
                onConfirm={() => handleUpdateStatus("claimed")}
                color="gold"
                loading={loading}
            />,
        );
    }

    function handleOpenGoneModal() {
        openModal(
            <ConfirmationModal
                title="Report Missing Item"
                icon={LuSearchX}
                body="Is the item no longer at the specified location?"
                confirmLabel="Confirm Gone"
                onConfirm={() => handleUpdateStatus("gone")}
                loading={loading}
            />,
        );
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

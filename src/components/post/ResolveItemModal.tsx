"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useModal } from "@/context/ModalContext";
import ConfirmationModal from "../ui/ConfirmationModal";
import { usePostAndItem } from "@/context/PostAndItemContext";

interface ResolveModalProps {
    itemId: string;
    itemName: string;
}

export default function ResolveItemModal({
    itemId,
    itemName,
}: ResolveModalProps) {
    const { closeModal } = useModal();
    const [isUpdating, setIsUpdating] = useState(false);
    const { refresh } = usePostAndItem();

    async function handleConfirmResolve() {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/lost-item-posts/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFound: true }),
            });

            if (res.ok) {
                closeModal();
                refresh();
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
        <ConfirmationModal
            title="Confirm Found Item"
            body={
                <>
                    Did you find{" "}
                    <span className="font-semibold text-foreground">
                        {itemName}
                    </span>
                    ? You are changing its status to{" "}
                    <span className="font-semibold text-foreground">
                        Item Found
                    </span>
                    .
                </>
            }
            loading={isUpdating}
            onConfirm={handleConfirmResolve}
            confirmingLabel="Processing..."
            confirmLabel="Yes, It's Found!"
        />
    );
}

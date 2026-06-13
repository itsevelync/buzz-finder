"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LuPencil, LuTrash } from "react-icons/lu";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useState } from "react";
import { useModal } from "@/context/ModalContext";

interface EditDeleteBtnsProps {
    editURL: string;
    deleteAPIRoute: string;
    redirect?: string;
}

export default function EditDeleteBtns({
    editURL,
    deleteAPIRoute,
    redirect = "/dashboard",
}: EditDeleteBtnsProps) {
    const router = useRouter();
    const { openModal } = useModal();
    const [confirming, setConfirming] = useState(false);

    async function handleDelete() {
        setConfirming(true);

        try {
            const res = await fetch(deleteAPIRoute, {
                method: "DELETE",
            });

            if (!res.ok) {
                toast.error("Error deleting item. Please try again");
                return;
            }

            toast.success("Item deleted successfully.");
            router.push(redirect);
        } catch (error) {
            console.log(error);
            toast.error("Error deleting item. Please try again");
        } finally {
            setConfirming(false);
        }
    }

    function openConfirmDeleteModal() {
        openModal(
            <ConfirmationModal
                title="Delete Item"
                body="Are you sure you want to delete this item?"
                onConfirm={handleDelete}
                loading={confirming}
            />,
        );
    }

    return (
        <div className="flex gap-2 mt-5">
            <Link
                href={editURL}
                className="hover:bg-buzz-gold/8 hover:saturate-150 flex gap-2 px-4 py-1 text-buzz-gold border border-buzz-gold rounded-full items-center transition"
            >
                <LuPencil /> Edit
            </Link>
            <button
                className="hover:bg-buzz-blue/7 hover:saturate-150 flex gap-2 px-4 py-1 text-buzz-blue border border-buzz-blue rounded-full items-center"
                onClick={openConfirmDeleteModal}
            >
                <LuTrash /> Delete
            </button>
        </div>
    );
}

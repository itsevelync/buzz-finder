"use client";

import Link from "next/link";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

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

    async function handleDelete() {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this item?"
        );

        if (!isConfirmed) return;

        try {
            const res = await fetch(deleteAPIRoute, {
                method: "DELETE",
            });

            if (!res.ok) {
                alert("Error deleting item. Please try again");
                return;
            }

            alert("Item deleted successfully.");
            router.push(redirect);
        } catch (error) {
            console.log(error);
            alert("Error deleting item. Please try again");
        }
    }

    return (
        <div className="flex gap-2 mt-5">
            <Link
                href={editURL}
                className="hover:brightness-90 hover:saturate-120 flex gap-2 border px-4 py-1 text-buzz-blue border-blue-300 bg-blue-100 rounded-full items-center"
            >
                <FaPencilAlt /> Edit
            </Link>
            <button
                className="hover:brightness-90 hover:saturate-120 flex gap-2 border px-4 py-1 text-[#c63c3c] border-red-300 bg-red-100 rounded-full items-center"
                onClick={handleDelete}
            >
                <FaTrash /> Delete
            </button>
        </div>
    );
}

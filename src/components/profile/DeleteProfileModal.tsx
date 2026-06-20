"use client";

import { deleteUser } from "@/actions/User";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { useModal } from "@/context/ModalContext";
import { LuTriangleAlert, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

export default function DeleteProfileModal() {
    const { closeModal } = useModal();
    const { user, setUser } = useUser();
    const { update } = useSession();
    const userID = user?._id ?? "";

    const router = useRouter();
    const [error, setError] = useState("");

    async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const values = Object.fromEntries(formData.entries()) as {
            confirmation: string;
        };

        const result = await deleteUser(userID, values);

        if (result.error) {
            setError(result.error);
            return;
        }
        await update(values);
        toast.success("Profile deleted successfully.");
        closeModal();
        setUser(null);
        router.push("/dashboard");
    }

    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    <LuTriangleAlert /> Delete Profile
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>
            <p className="opacity-70 mb-4">
                You are about to permanently delete your BuzzFinder account. This action cannot
                be undone.
            </p>

            <div className="text-red-500">{error}</div>
            <form className="form" onSubmit={onSubmit}>
                <FormInput
                    label="Type 'Confirm Deletion' (case-sensitive) to confirm."
                    name="confirmation"
                    type="text"
                    placeholder="Type here..."
                />
                <button type="submit">Delete Account</button>
            </form>
        </div>
    );
}

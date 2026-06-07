"use client";

import { deleteUser } from "@/actions/User";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { IoClose } from "react-icons/io5";

interface DeleteProfileModalProps {
    onClose: () => void;
}

export default function DeleteProfileModal({
    onClose,
}: DeleteProfileModalProps) {
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
        console.log(result);

        if (result.error) {
            setError(result.error);
            return;
        }
        await update(values);
        setUser(null);
        router.push("/dashboard");
    }

    return (
        <div className="fixed z-10000 flex items-center justify-center inset-0 bg-gray-600/50 h-full w-full p-4">
            <div className="p-5 border border-buzz-blue/40 w-full max-w-2xl shadow-lg rounded-lg bg-white">
                <div className="flex justify-between gap-2">
                    <h1 className="text-lg font-medium">Delete Profile</h1>
                    <IoClose
                        className="transition-all p-0.5 cursor-pointer text-2xl rounded hover:bg-buzz-blue/10"
                        onClick={onClose}
                    />
                </div>
                <p className="opacity-50 text-sm mb-4">
                    Permanently delete your BuzzFinder account? This action cannot be undone.
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
        </div>
    );
}

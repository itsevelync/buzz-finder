"use client";

import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { useModal } from "@/context/ModalContext";
import { LuTriangleAlert, LuX } from "react-icons/lu";
import { toast } from "react-toastify";
import { doLogout } from "@/actions/User";

export default function DeleteProfileModal() {
    const { closeModal } = useModal();
    const { user, setUser } = useUser();
    const userID = user?._id ?? "";

    async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const confirmation = formData.get("confirmation") as string;

        if (confirmation !== "Confirm Deletion") {
            toast.error("Confirmation text does not match.");
            return;
        }

        try {
            const res = await fetch(`/api/users/${userID}`, {
                method: "DELETE",
            });
        
            if (!res.ok) {
                const errData = await res.json();
                toast.error(`Error deleting account: ${errData.error || "Unknown server error."}`);
                return;
            }
        
            toast.success("Account deleted successfully.");
            closeModal();
            setUser(null);
            doLogout();
        } catch (error) {
            console.error("Error deleting profile:", error);
            toast.error("Error deleting profile. Please try again");
        }
    }

    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-red-700">
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

            <form className="form" onSubmit={onSubmit}>
                <FormInput
                    label="Type 'Confirm Deletion' (case-sensitive) to confirm."
                    name="confirmation"
                    type="text"
                    placeholder="Type here..."
                />
                <button type="submit" className="bg-red-700!">Delete Account</button>
            </form>
        </div>
    );
}

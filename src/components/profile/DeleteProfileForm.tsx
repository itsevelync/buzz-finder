'use client'

import { deleteUser, updateUser } from "@/actions/User";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";


const DeleteProfileForm = ({ userID }: { userID: string }) => {
    const { data: session, update } = useSession();
    
    const router = useRouter();
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        router.push("/dashboard");
    }

    return (
        <>
            <div className="text-red-500">{error}</div>
            <form
                className="form"
                onSubmit={onSubmit}>
                <FormInput label="Enter 'Confirm Deletion' (case-sensitive) to confirm" name="confirmation" type="text" placeholder="Type here" />
                <button type="submit">
                    Delete Profile
                </button>
            </form>
        </>
    );
};

export default DeleteProfileForm;
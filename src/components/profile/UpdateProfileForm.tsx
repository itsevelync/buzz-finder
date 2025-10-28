'use client'

import { updateUser } from "@/actions/User";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";


export default function UpdateProfileForm({ userID }: { userID: string }) {
    const { data: session, update } = useSession();
    
    const router = useRouter();
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const values = Object.fromEntries(formData.entries()) as {
            name: string;
            password: string;
        };

        const result = await updateUser(userID, values);
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
                <FormInput label="Password" name="password" type="password" placeholder="securePassword123!" />
                <FormInput label="Name" name="name" type="text" placeholder="First Last" />
                <button type="submit">
                    Update Profile
                </button>
            </form>
        </>
    );
};

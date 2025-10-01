'use client'

import SocialLogins from "@/components/auth/SocialLogins";
import { updateUser } from "@/actions/User";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Divider from "../ui/Divider";
import Link from "next/link";
import { auth } from "@/auth";
import { useSession } from "next-auth/react";


const UpdateProfileForm = ({ userID }: { userID: string }) => {
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
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="text" name="password" id="password"
                        placeholder="securePassword123!" />
                </div>

                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" name="name" id="name"
                        placeholder="First Last" />
                </div>

                <button type="submit">
                    Update Profile
                </button>
            </form>
        </>
    );
};

export default UpdateProfileForm;
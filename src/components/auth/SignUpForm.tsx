"use client"

import { useState } from "react";
import Divider from "../ui/Divider";
import SocialLogins from "./SocialLogins";

import { useRouter } from "next/navigation";
import { signupUser } from "@/actions/User";

export default function SignUpForm() {
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const response = await signupUser(formData);

        if (response?.error) {
            setError(response.error);
        } else if (response?.success) {
            alert("Account created successfully. Redirecting you to the login page.");
            router.push("/login");
        }
    }

    return (
        <>
            {error && <div className="text-red-500">{error}</div>}
            <form className="form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Enter your name"
                    />
                </div>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name="email" id="email" />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>

                <button type="submit">Register</button>
            </form>
            <Divider text="or" />
            <SocialLogins />
        </>
    );
}
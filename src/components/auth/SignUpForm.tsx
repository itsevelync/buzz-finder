"use client"

import { useState } from "react";
import Divider from "../ui/Divider";
import SocialLogins from "./SocialLogins";

import { useRouter } from "next/navigation";
import { signupUser } from "@/actions/User";
import FormInput from "../ui/FormInput";

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
                <FormInput label="Name" name="name" placeholder="George P. Burdell" required />
                <FormInput label="Email Address" name="email" type="email" placeholder="gburdell3@gatech.edu" required />
                <FormInput label="Password" name="password" type="password" placeholder="Password" required />

                <button type="submit">Register</button>
            </form>

            <Divider text="or" />
            <SocialLogins />
        </>
    );
}
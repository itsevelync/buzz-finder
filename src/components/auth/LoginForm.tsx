"use client";

import SocialLogins from "./SocialLogins";
import { doCredentialLogin } from "@/actions/User";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Divider from "../ui/Divider";
import Link from "next/link";
import FormInput from "../ui/FormInput";

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const result = await doCredentialLogin(formData);
        console.log(result);

        if (result.error) {
            setError(result.error);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <>
            <div className="text-red-500">{error}</div>

            <form className="form" onSubmit={onSubmit}>
                <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="gburdell3@gatech.edu"
                    required
                />
                <div>
                    <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                    />
                    <Link
                        className="link text-sm text-gray-600"
                        href="/reset-password"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit">Login</button>
            </form>

            <Divider text="or" />
            <SocialLogins />
            <Divider text="or" />
            {/* Continue as guest */}
            <div className="text-center">
                <button
                    className="rounded-2xl px-2 py-1.5 bg-buzz-blue text-white w-full"
                    onClick={() => router.push("/dashboard")}
                >
                    Continue as Guest
                </button>
            </div>
        </>
    );
}

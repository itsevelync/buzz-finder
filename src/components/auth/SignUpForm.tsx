"use client";

import { useState } from "react";
import Divider from "../ui/Divider";
import SocialLogins from "./SocialLogins";

import { useRouter } from "next/navigation";
import { signupUser } from "@/actions/User";
import {
    sendVerificationCode,
    compareVerificationCode,
} from "@/actions/VerificationCode";
import FormInput from "../ui/FormInput";
import { toast } from "react-toastify";

export default function SignUpForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    async function handleSignUp(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;

        const response = await sendVerificationCode(email, name);

        if (response?.error) {
            setError(response.error);
        } else if (response?.success) {
            toast.success(response.success);
            setVerificationEmail(email);
            setName(name);
            setPassword(password);
            setIsVerifying(true);
        }
    }

    async function handleVerification(
        event: React.SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const code = formData.get("code") as string;

        const response = await compareVerificationCode(verificationEmail, code);

        if (response?.error) {
            setError(response.error);
        } else if (response?.success) {
            const signUpFormData = new FormData();
            signUpFormData.append("name", name);
            signUpFormData.append("email", verificationEmail);
            signUpFormData.append("password", password);

            const signUpResponse = await signupUser(signUpFormData);

            if (signUpResponse?.error) {
                setError(signUpResponse.error);
            } else if (signUpResponse?.success) {
                toast.success(
                    "Account created successfully. Redirecting you to the login page.",
                );
                router.push("/login");
            }
        }
    }

    return (
        <>
            {error && <div className="text-red-500">{error}</div>}

            {!isVerifying ? (
                <form key="signUp" className="form" onSubmit={handleSignUp}>
                    <FormInput
                        label="Name"
                        name="name"
                        placeholder="George P. Burdell"
                        required
                    />
                    <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="gburdell3@gatech.edu"
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        required
                    />
                    <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                    />

                    <button type="submit">Register</button>
                </form>
            ) : (
                <form
                    key="verify"
                    className="form"
                    onSubmit={handleVerification}
                >
                    <p>
                        A verification code has been sent to {verificationEmail}
                        . Be sure to check your spam or promotions folder, or
                        wait a few minutes for it to arrive.
                    </p>
                    <FormInput
                        label="Verification Code"
                        name="code"
                        placeholder="XXXXXX"
                        required
                        autoComplete="one-time-code"
                    />
                    <button type="submit">Verify</button>
                </form>
            )}

            <Divider text="or" />
            <SocialLogins />
        </>
    );
}

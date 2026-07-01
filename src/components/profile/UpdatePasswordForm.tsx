"use client";

import { updateUser } from "@/actions/User";
import { useState } from "react";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { LuBadgeInfo } from "react-icons/lu";

export default function UpdateProfileForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");

    const { user } = useUser();
    const { update } = useSession();
    const userID = user?._id ?? "";

    // Determine if the user signed up via SSO and lacks a password
    // (Ensure your backend/context provides a way to check this, e.g., user.hasPassword)
    const hasPassword = user?.password ?? false;

    async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        const values = {
            password,
            ...(hasPassword && { currentPassword }), // Only send currentPassword if they have one
        };

        const result = await updateUser(userID.toString(), values);

        if (result.error) {
            setError(result.error);
            return;
        }

        await update();
        setPassword("");
        setCurrentPassword("");
        setPasswordConfirm("");
        setError("");
        toast.success("Password updated successfully!");
    }

    const getPasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strength = getPasswordStrength(password);

    return (
        <div className="max-w-xl space-y-6">
            <h2 className="text-lg font-semibold">Change Password</h2>

            {/* SSO / No-Password Banner (Matches your screenshot styling) */}
            {!hasPassword && (
                <div className="flex items-start gap-3 rounded-lg bg-buzz-blue/3 p-4 text-sm border border-buzz-blue/20">
                    <LuBadgeInfo className="text-buzz-blue text-2xl" />
                    <div className="flex-1 space-y-1">
                        <p>
                            You don&rsquo;t have a BuzzFinder password because
                            you created your account with a single sign on
                            method.
                        </p>
                        <p className="opacity-80">
                            You can set a password using the form below.
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm font-medium">{error}</div>
            )}

            <form className="form" onSubmit={onSubmit}>
                {/* Conditionally render the Current Password input field */}
                {hasPassword && (
                    <FormInput
                        label="Current Password"
                        name="current-password"
                        type="password"
                        value={currentPassword}
                        onInputChange={(e) =>
                            setCurrentPassword(e.target.value)
                        }
                    />
                )}

                <div>
                    <FormInput
                        label={hasPassword ? "New Password" : "Set Password"}
                        name="new-password"
                        type="password"
                        value={password}
                        onInputChange={(e) => setPassword(e.target.value)}
                    />

                    {password && (
                        <div className="mt-3">
                            <div className="h-2 rounded-full bg-neutral-200">
                                <div
                                    className="h-2 rounded-full bg-buzz-gold transition-all"
                                    style={{ width: `${strength * 25}%` }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-neutral-500">
                                {
                                    [
                                        "Very Weak",
                                        "Weak",
                                        "Fair",
                                        "Strong",
                                        "Excellent",
                                    ][strength]
                                }
                            </p>
                        </div>
                    )}
                </div>

                <FormInput
                    label="Confirm Password"
                    name="confirm-password"
                    type="password"
                    value={passwordConfirm}
                    onInputChange={(e) => setPasswordConfirm(e.target.value)}
                />

                <button className="rounded-lg bg-buzz-blue px-5 py-2 text-white hover:opacity-90 font-medium transition-opacity">
                    {hasPassword ? "Update Password" : "Set Password"}
                </button>
            </form>
        </div>
    );
}

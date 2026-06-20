"use client";

import { updateUser } from "@/actions/User";
import { useState } from "react";
import { useSession } from "next-auth/react";
import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

export default function UpdateProfileForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const { user } = useUser();
    const { update } = useSession();
    const userID = user?._id ?? "";

    const [error, setError] = useState("");

    async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        const values = {
            password,
            currentPassword,
        };

        const result = await updateUser(userID.toString(), values);

        if (result.error) {
            setError(result.error);
            return;
        }
        await update();
        setPassword("")
        setCurrentPassword("")
        setPasswordConfirm("")
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
        <>
            
            <form className="form" onSubmit={onSubmit}>
                <h2 className="mb-2 text-lg font-semibold">Change Password</h2>
{error && <div className="text-red-500">{error}</div>}
                <div className="max-w-xl space-y-4">
                    <FormInput
                        label="Current Password"
                        name="current-password"
                        type="password"
                        value={currentPassword}
                        onInputChange={(e) => {
                            setCurrentPassword(e.target.value);
                        }}
                    />
                    <div>
                        <FormInput
                            label="New Password"
                            name="new-password"
                            type="password"
                            value={password}
                            onInputChange={(e) => {
                                setPassword(e.target.value);
                            }}
                        />

                        {password && (
                            <div className="mt-3">
                                <div className="h-2 rounded-full bg-neutral-200">
                                    <div
                                        className="h-2 rounded-full bg-buzz-gold transition-all"
                                        style={{
                                            width: `${strength * 25}%`,
                                        }}
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
                        label="Confirm New Password"
                        name="confirm-password"
                        type="password"
                        value={passwordConfirm}
                        onInputChange={(e) => {
                            setPasswordConfirm(e.target.value);
                        }}
                    />

                    <button className="rounded-lg bg-buzz-blue px-5 py-2 text-white hover:opacity-90">
                        Update Password
                    </button>
                </div>
            </form>
        </>
    );
}

'use client'

import { compareResetCode, sendResetCode } from "@/actions/ResetCode";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUserFromEmail } from "@/actions/User";

type ErrorState = {
    message: string;
    linkText?: string;
    linkHref?: string;
} | null;

const ResetPasswordForm = () => {
    const router = useRouter();
    const [error, setError] = useState<ErrorState>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [formData, setFormData] = useState({
        email: '',
        resetCode: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleClearMessage = () => {
        setSuccessMessage("");
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData2 = new FormData(event.currentTarget);

        // Clear previous messages
        setError(null);
        setSuccessMessage("");

        if (!formData.email) {
            setError({ message: "Please enter a valid email address." });
            return;
        }

        try {
            // Call the server action to send the reset code, passing only the email
            const response = await sendResetCode(formData.email);

            if (response?.error) {
                setError({ message: response.error });
                if (response.linkHref) {
                    // You can store this in state or handle it dynamically
                    // For this example, we'll just render it
                    setError({
                        message: response.error,
                        linkText: response.linkText,
                        linkHref: response.linkHref
                    });
                }
            } else if (response?.success) {

                // Set a success message for the user. We don't redirect immediately to
                // give the user a moment to read the confirmation.
                setSuccessMessage("If an account exists for that email address, you will receive a password reset link shortly.");
            }

        } catch (e: any) {
            // Display a generic error message to the user for security.
            // This prevents an attacker from knowing if an email exists.
            setError({ message: "Failed to send reset instructions. Please try again later." });
        }
    }

    async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError({ message: "Passwords do not match." });

            setIsSubmitting(false);
            return;
        }

        // Call the server action to compare the codes
        const response = await updateUserFromEmail(formData.email, { password: formData.newPassword });

        if (response.success) {
            // Code is valid, redirect the user to the password reset page
            alert("Password updated successfully. Redirecting you to login page.");
            router.push('/login');
        } else if (response.error) {
            setError({ message: response.error });
        }

        setIsSubmitting(false);
    }


    async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Call the server action to compare the codes
        const response = await compareResetCode(formData.email, formData.resetCode);

        if (response.success) {
            // Code is valid, redirect the user to the password reset page
            alert("Code verified successfully. You can now set a new password.");
            setVerified(true);
        } else if (response.error) {
            setError({ message: response.error });
        }

        setIsSubmitting(false);
    }

    if (verified) {
        return (
            <>
                {error && <div className="text-red-500 mb-4">{error.message}</div>}
                <div>Code verified successfully. You can now set a new password.</div>
                <form
                    className="form"
                    onSubmit={handlePasswordChange}>
                    <div>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            id="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleFormChange}
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Reset Password'}
                    </button>
                </form>
            </>
        );
    }

    if (successMessage) {
        return (
            <>
                {error && <div className="text-red-500 mb-4">{error.message}</div>}
                <div>Please enter the verification code we sent to {formData.email}.</div>
                <form
                    className="form"
                    onSubmit={handleCodeSubmit}>
                    <div>
                        <label htmlFor="resetCode">Verification Code</label>
                        <input
                            type="text"
                            name="resetCode"
                            id="resetCode"
                            placeholder="XXXXXX"
                            required
                            minLength={6}
                            maxLength={6}
                            disabled={isSubmitting}
                            value={formData.resetCode}
                            onChange={handleFormChange}
                        />
                        <p className="text-sm text-gray-600">Not {formData.email}? Click <span className="link" onClick={handleClearMessage}>here</span> to enter a different email.</p>
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Verifying...' : 'Confirm Verification Code'}
                    </button>
                </form>
            </>
        );
    }

    return (
        <>
            {successMessage && <div className="success text-green-500">{successMessage}</div>}
            {error && (
                <div className="text-red-500">
                    {error.message}
                    {error.linkHref && error.linkText && (
                        <>
                            <Link href={error.linkHref} className="link">
                                {error.linkText}
                            </Link>.</>
                    )}
                </div>
            )}
            <p>Enter the email associated with your account and we'll send you password reset instructions.</p>
            <form
                className="form"
                onSubmit={handleEmailSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name="email" id="email"
                        placeholder="gburdell3@gatech.edu" required
                        value={formData.email}
                        onChange={handleFormChange} />
                </div>

                <button type="submit">
                    Send Reset Instructions
                </button>
            </form>
        </>
    );
};

export default ResetPasswordForm;
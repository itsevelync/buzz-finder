import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password - BuzzFinder",
};

export default function ResetPasswordPage() {
    return (
        <AuthPageLayout
            title="Reset Password"
            bottomText={
                <>
                    Return to{" "}
                    <Link className="link" href="/login">
                        Login
                    </Link>
                </>
            }
        >
            <ResetPasswordForm />
        </AuthPageLayout>
    );
}

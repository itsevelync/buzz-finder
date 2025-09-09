import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <AuthPageLayout
            title="Reset Password"
            bottomText={
                <>
                    Return to{" "}
                    <Link className="link" href="/login">Login</Link>
                </>
            }
        >
            <ResetPasswordForm />
        </AuthPageLayout>
    );
}
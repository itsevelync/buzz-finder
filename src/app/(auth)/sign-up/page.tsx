import SignUpForm from "@/components/auth/SignUpForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up - BuzzFinder",
};

export default function SignUpPage() {
    return (
        <AuthPageLayout
            title="Create a BuzzFinder Account"
            bottomText={
                <>
                    Already have an account?{" "}
                    <Link className="link" href="/login">
                        Login
                    </Link>
                </>
            }
        >
            <SignUpForm />
        </AuthPageLayout>
    );
}

import LoginForm from "@/components/auth/LoginForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import Link from "next/link";

export default function SignInPage() {
    return (
        <AuthPageLayout
            title="Login to BuzzFinder"
            bottomText={
                <>
                    Don't have an account?{" "}
                    <Link className="link" href="/sign-up">Register</Link>
                </>
            }
        >
            <LoginForm />
        </AuthPageLayout>
    );
}
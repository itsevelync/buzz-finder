import LoginForm from "@/components/auth/LoginForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
    const session = await auth();

    if (session?.user) redirect("/dashboard");

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
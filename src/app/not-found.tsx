import Link from "next/link";
import { LuSearch } from "react-icons/lu";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="mx-auto max-w-2xl text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-buzz-gold/10 p-6">
                        <LuSearch size={64} className="text-buzz-blue" />
                    </div>
                </div>

                <p className="mb-2 text-2xl font-semibold uppercase tracking-[0.3em] text-buzz-gold">
                    404
                </p>

                <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                    This page has been lost.
                </h1>

                <p className="mx-auto mb-8 max-w-lg text-lg text-foreground/70">
                    Hopefully, someone will find it and post it on BuzzFinder.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-10">
                    <Link
                        href="/"
                        className="rounded-lg bg-buzz-blue px-6 py-3 font-medium text-white transition hover:opacity-90"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

import Link from "next/link";
import { LuSignpost } from "react-icons/lu";

export default function NotFound() {
    return (
        <main className="flex h-full items-center justify-center bg-background px-8">
            <div className="mx-auto max-w-2xl text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-buzz-gold/8 p-6 border border-buzz-gold/50 border-dashed">
                        <LuSignpost size={64} className="text-buzz-gold" />
                    </div>
                </div>

                <p className="mb-3 text-2xl font-semibold uppercase tracking-[0.3em] text-buzz-gold">
                    404
                </p>

                <h1 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
                    This page has been lost.
                </h1>

                <p className="mx-auto mb-8 max-w-lg text-lg text-foreground/70">
                    Hopefully, someone will find it and post it on BuzzFinder.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-4">
                    <Link
                        href="/"
                        className="rounded-lg text-buzz-blue px-4 py-2 font-medium transition hover:opacity-90"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

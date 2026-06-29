import Link from "next/link";
import { useState } from "react";
import { LuPlus } from "react-icons/lu";

export default function FAQTab() {
    // FAQ Active Accordion state
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-buzz-blue">
                    Frequently Asked Questions
                </h2>
            </div>

            {[
                {
                    q: "What is the difference between a lost item and a found item?",
                    a: (
                        <>
                            A <i>lost item</i> is an item that you have lost and
                            need help finding. A <i>found item</i> is an item
                            you found that was lost by someone else.
                        </>
                    ),
                },
                {
                    q: "How do I report an item?",
                    a: (
                        <>
                            Visit the{" "}
                            <Link
                                href="/report-item"
                                className="text-foreground font-medium"
                            >
                                Report Item
                            </Link>{" "}
                            page to report a lost or found item.
                        </>
                    ),
                },
                {
                    q: "Can I report items anonymously?",
                    a: (
                        <>
                            Absolutely. If you are signed in, you can select
                            &ldquo;Don&rsquo;t connect my account
                            information&rdquo; to post anonymously.
                        </>
                    ),
                },
                {
                    q: "Should I create an account?",
                    a: (
                        <>
                            We designed BuzzFinder so that anyone can view and
                            report items without an account. If you would like
                            notifications about items or in-app messaging with
                            other BuzzFinder users, you will need to{" "}
                            <Link
                                href="sign-up"
                                className="font-medium text-foreground"
                            >
                                create an account
                            </Link>
                            .
                        </>
                    ),
                },
                {
                    q: "How do I communicate safely with other users?",
                    a: (
                        <>
                            If you have an account, you can communicate directly
                            with other BuzzFinder users through the{" "}
                            <Link
                                href="/messages"
                                className="text-foreground font-medium"
                            >
                                Messages
                            </Link>{" "}
                            page.
                        </>
                    ),
                },
                {
                    q: "What does it mean for an item to be claimed?",
                    a: (
                        <>
                            Claiming an item means that the owner has
                            successfully recovered their item. You should mark
                            the an item as claimed if you&rsquo;re the owner of
                            a found item or you&rsquo;ve coordinated returning a
                            found item to its owner.
                        </>
                    ),
                },
                {
                    q: "Why was my item marked as archived?",
                    a: (
                        <>
                            To avoid clutter, items are automatically marked as
                            archived after three weeks. These items will still
                            be searchable from the{" "}
                            <Link
                                href="/dashboard"
                                className="font-medium text-foreground"
                            >
                                Dashboard
                            </Link>{" "}
                            but will be hidden from the{" "}
                            <Link
                                href="/map"
                                className="font-medium text-foreground"
                            >
                                Map
                            </Link>{" "}
                            page.
                        </>
                    ),
                },
                {
                    q: "I have other questions. Who can I ask?",
                    a: (
                        <>
                            If you have other questions, contact the team using
                            our{" "}
                            <Link
                                href="/help/contact"
                                className="text-foreground font-medium"
                            >
                                Contact Form
                            </Link>
                            . We&rsquo;ll get back to you shortly!
                        </>
                    ),
                },
            ].map((faq, idx) => {
                const isCurrentOpen = openFaq === idx;
                return (
                    <div
                        key={idx}
                        className="bg-background border border-foreground/15 rounded-lg overflow-hidden shadow-sm transition-all"
                    >
                        <button
                            onClick={() =>
                                setOpenFaq(isCurrentOpen ? null : idx)
                            }
                            className="gap-2 w-full text-left px-6 py-4 flex items-center justify-between font-medium text-buzz-blue text-lg"
                        >
                            <span>{faq.q}</span>
                            <span
                                className={`text-xl transition-transform text-buzz-gold ${isCurrentOpen ? "rotate-45" : ""}`}
                            >
                                <LuPlus />
                            </span>
                        </button>

                        <div
                            className={`transition-all  px-6 duration-300 ease-in-out overflow-hidden ${
                                isCurrentOpen
                                    ? "max-h-80 pb-6"
                                    : "max-h-0 pointer-events-none"
                            }`}
                        >
                            <p className="text-foreground/80">{faq.a}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

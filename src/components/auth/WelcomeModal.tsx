"use client";

import { useModal } from "@/context/ModalContext";
import Image from "next/image";
import Link from "next/link";
import {
    LuUserRound,
    LuSearch,
    LuClipboardList,
    LuArrowRight,
    LuX,
    LuSparkles,
} from "react-icons/lu";

export default function WelcomeModal() {
    const { closeModal } = useModal();
    return (
        <div className="bg-background rounded-lg border border-foreground/10 shadow p-0.5">
            <div className="max-h-[80vh] overflow-y-scroll">
                <div className="pt-1 pr-1 sticky top-0 flex justify-end">
                    <button
                        onClick={closeModal}
                        aria-label="Close welcome screen"
                        className="ml-auto rounded-lg p-2 text-foreground/60 transition-colors bg-background/80 hover:bg-foreground/5 hover:text-foreground"
                    >
                        <LuX className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 sm:p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/images/buzzfinder-logo.png"
                            alt="BuzzFinder Logo"
                            width={130}
                            height={130}
                            className="-mx-5 -mt-7 mb-2"
                        />

                        <h1 className="text-3xl font-bold text-buzz-blue md:text-4xl">
                            Welcome to BuzzFinder!{" "}
                            <LuSparkles className="inline align-middle ml-1 pb-1" />
                        </h1>

                        <p className="mt-4 max-w-xl text-foreground/70 text-lg">
                            Find lost items, return found items, and help people
                            reconnect with their belongings.
                        </p>
                    </div>

                    {/* Next Steps */}
                    <div className="mt-12">
                        <h2 className="text-lg font-semibold text-buzz-blue">
                            What would you like to do first?
                        </h2>

                        <div className="mt-6 grid gap-4">
                            <ActionCard
                                icon={<LuSearch className="h-5 w-5" />}
                                title="Browse Items"
                                description="Explore recent lost and found items in your area."
                                href="/dashboard"
                                buttonText="Dashboard"
                            />

                            <ActionCard
                                icon={<LuClipboardList className="h-5 w-5" />}
                                title="Report an Item"
                                description="Report a lost item or post something you've found."
                                href="/report-item"
                                buttonText="Report Form"
                            />

                            <ActionCard
                                icon={<LuUserRound className="h-5 w-5" />}
                                title="Complete Your Profile"
                                description="Add a photo and a few details so others can recognize and contact you."
                                href="/settings?tab=profile"
                                buttonText="Settings"
                            />
                        </div>
                    </div>
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={closeModal}
                            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type ActionCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    buttonText: string;
};

function ActionCard({
    icon,
    title,
    description,
    href,
    buttonText,
}: ActionCardProps) {
    const { closeModal } = useModal();
    return (
        <div className="group rounded-2xl border border-foreground/10 p-5 transition-all hover:border-buzz-gold/40 hover:bg-buzz-gold/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-buzz-blue text-white">
                        {icon}
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground">
                            {title}
                        </h3>

                        <p className="mt-1 text-sm text-foreground/70">
                            {description}
                        </p>
                    </div>
                </div>

                <Link
                    href={href}
                    onClick={closeModal}
                    className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-buzz-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-buzz-blue/90"
                >
                    {buttonText}
                    <LuArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

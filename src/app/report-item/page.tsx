import FoundItemForm from "@/components/report-item/FoundItemForm";
import ReportTypeSelection from "@/components/report-item/ReportTypeSelection";
import Link from "next/link";
import { LuChevronLeft } from "react-icons/lu";
import LostItemPostForm from "@/components/post/LostItemPostForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Report Item - BuzzFinder",
};

interface PageProps {
    searchParams: Promise<{ type?: string }>;
}

export default async function ReportItemPage({ searchParams }: PageProps) {
    const { type } = await searchParams;

    if (type === "found" || type === "lost") {
        return (
            <div>
                <div className="max-w-6xl mx-auto px-4 pt-6 sm:px-8 flex">
                    <Link
                        href="/report-item"
                        className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all"
                    >
                        <LuChevronLeft /> Change Report Type
                    </Link>
                </div>
                {type === "found" ? <FoundItemForm /> : <LostItemPostForm />}
            </div>
        );
    }

    return <ReportTypeSelection />;
}

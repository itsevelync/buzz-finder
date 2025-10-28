import { notFound } from "next/navigation";
import Image from "next/image";
import { dbConnect } from "@/lib/mongo";
import {
    FaChevronLeft,
    FaHandPaper,
    FaPencilAlt,
    FaTrash,
} from "react-icons/fa";
import Link from "next/link";
import CenteredMap from "@/components/maps/CenteredMap";
import { categories } from "@/constants/Categories";
import { Item } from "@/model/Item";

interface ItemPageProps {
    params: {
        id: string;
    };
}

async function getItem(id: string) {
    try {
        await dbConnect();
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/item/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(
                `Failed to fetch item: ${res.status} ${res.statusText}`
            );
            return null;
        }

        const data = await res.json();
        return data.item;
    } catch (error) {
        console.error("Error fetching item:", error);
        return null;
    }
}

export default async function ItemPage({ params }: ItemPageProps) {
    params = await params;
    const item = (await getItem(params.id)) as Item;
    const category = categories[item.category];

    if (!item) {
        notFound();
    }

    const formattedLostDate = new Date(item.lostdate).toLocaleDateString();
    const formattedLostTime = new Date(item.lostdate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="p-5 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
            <Link
                href="/dashboard"
                className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all"
            >
                <FaChevronLeft /> View all Items
            </Link>
            <div className="flex flex-col sm:flex-row w-full items-center justify-between sm:items-start">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold">
                        {item.title ?? "N/A"}
                    </h1>
                    <p className="text-gray-500 mb-2">{`Found on ${formattedLostDate} at ${formattedLostTime}`}</p>
                    <p
                        style={{
                            color: category.color,
                            backgroundColor: category.color + "20",
                        }}
                        className="w-fit rounded-full px-4 py-1 m-auto sm:m-0"
                    >
                        {category.label ?? "N/A"}
                    </p>
                </div>
                <div className="flex gap-2 mt-5">
                    <button className="hover:brightness-90 hover:saturate-120 flex gap-2 border px-4 py-1 text-buzz-blue border-blue-300 bg-blue-100 rounded-full items-center">
                        <FaPencilAlt /> Edit
                    </button>
                    <button className="hover:brightness-90 hover:saturate-120 flex gap-2 border px-4 py-1 text-[#c63c3c] border-red-300 bg-red-100 rounded-full items-center">
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
            <div className="flex gap-6 flex-col md:flex-row">
                <div className="w-full items-center md:w-1/3 lg:w-1/4 flex flex-col gap-2">
                    <Image
                        src={item.image?.url ?? "/img-placeholder.jpg"}
                        alt={`${item.title} Image`}
                        className="object-cover rounded-xl border-gray-300 shadow mb-4"
                        width={280}
                        height={280}
                    />
                    <button className="bg-buzz-gold flex items-center gap-2 text-white text-xl px-6 shadow-md hover:brightness-110 hover:shadow filter hover:saturate-180 hover:translate-y-0.5 shadow-buzz-gold/50 py-1.5 rounded-full">
                        <FaHandPaper /> Claim Item
                    </button>
                    <p className="underline opacity-80">Item no longer there?</p>
                </div>
                <div className="flex flex-col gap-10 grow">
                    <div className="h-90 w-full rounded-xl overflow-hidden border border-gray-300 shadow">
                        <CenteredMap
                            width="100%"
                            height="100%"
                            pin={item}
                            disableHover={true}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-4">
                        <h2 className="font-bold text-2xl">Item Details</h2>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Description
                            </h3>
                            <p>{item.item_description ?? "N/A"}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Retrieval Information
                            </h3>
                            <p>{item.retrieval_description ?? "N/A"}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Location Details
                            </h3>
                            <p>{item.location_details ?? "N/A"}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Contact Information
                            </h3>
                            <p>{item.contact_info ?? "N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

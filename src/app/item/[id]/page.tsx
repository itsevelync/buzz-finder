import { notFound } from "next/navigation";
import Image from "next/image";
import { dbConnect } from "@/lib/mongo";
import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import CenteredMap from "@/components/maps/CenteredMap";

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
    const item = await getItem(params.id);

    if (!item) {
        notFound();
    }

    const formattedLostDate = new Date(item.lostdate).toLocaleDateString();
    const formattedLostTime = new Date(item.lostdate).toLocaleTimeString();

    return (
        <div className="p-5 max-w-5xl m-auto flex flex-col gap-4">
            <Link href="/dashboard" className="flex items-center gap-1">
                <FaChevronLeft /> View all Items
            </Link>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{item.title ?? "N/A"}</h1>
                <p className="text-gray-500">{item.category ?? "N/A"}</p>
            </div>
            <div className="flex gap-6 flex-col md:flex-row">
                <div className="w-full items-center md:w-1/4 flex flex-col gap-2">
                    <Image
                        src={item.image?.url ?? "/img-placeholder.jpg"}
                        alt={`${item.title} Image`}
                        className="object-cover rounded-xl border-gray-300 shadow"
                        width={250}
                        height={250}
                    />
                    <p className="text-gray-500">{`Found on ${formattedLostDate} at ${formattedLostTime}`}</p>
                </div>
                <div className="h-90 grow rounded-xl overflow-hidden border border-gray-300 shadow">
                    <CenteredMap width="100%" height="100%" pin={item} />
                </div>
                                 
            </div>
                <div className="w-full flex flex-col gap-4 border border-gray-300 shadow p-4 rounded-xl">
                    <div>
                        <h3 className="font-bold">Description</h3>
                        <p>{item.item_description ?? "N/A"}</p>
                    </div>
                    <div>
                        <h3 className="font-bold">Retrieval Information</h3>
                        <p>{item.retrieval_description ?? "N/A"}</p>
                    </div>
                    <div>
                        <h3 className="font-bold">Location Details</h3>
                        <p>{item.location_details ?? "N/A"}</p>
                    </div>
                    <div>
                        <h3 className="font-bold">Contact Info</h3>
                        <p>{item.contact_info ?? "N/A"}</p>
                    </div>
                </div>
            </div>   
    );
}

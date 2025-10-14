"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LostFoundSelector from "./LostFoundSelector";
import { Item } from "@/model/Item";
import ItemList from "./ItemList";
import useSWR from "swr";
import SearchBar from "../ui/SearchBar";

export default function LostFoundDashboardContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [lostItemsSelected, setLostItemsSelected] = useState<boolean>(
        searchParams.get("tab") === "lost"
    );
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const {
        data: items,
        error,
        isLoading,
    } = useSWR<Item[]>("/api/item", fetcher);

    // Keep tab in URL synced
    useEffect(() => {
        const newTab = lostItemsSelected ? "lost" : "found";
        router.replace(`?tab=${newTab}`);
    }, [lostItemsSelected, router]);

    // Reset filtered items when data or tab changes
    useEffect(() => {
        if (items) {
            setFilteredItems(
                items.filter((item) => item.isLost === lostItemsSelected)
            );
        }
    }, [items, lostItemsSelected]);

    return (
        <div>
            <div className="flex flex-col justify-start align-middle w-full">
                <div className="sticky top-0 z-10 bg-white">
                    <LostFoundSelector
                        lostItemsSelected={lostItemsSelected}
                        setLostItemsSelected={setLostItemsSelected}
                    />
                    {!lostItemsSelected && (
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <SearchBar<Item>
                                placeholder="Search by title, description, or location"
                                items={items || []}
                                setFilteredItems={setFilteredItems}
                                searchableFields={[
                                    "title",
                                    "item_description",
                                    "retrieval_description",
                                    "category",
                                    "location_details",
                                ]}
                            />
                        </div>
                    )}
                </div>

                <div className="p-5">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : error || !items ? (
                        <div>Error loading items</div>
                    ) : (
                        <ItemList
                            items={filteredItems}
                            lostItemsSelected={lostItemsSelected}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

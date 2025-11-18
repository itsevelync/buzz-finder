"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LostFoundSelector from "./LostFoundSelector";
import { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";
import ItemList from "./ItemList";
import useSWR from "swr";
import SearchBar from "../ui/SearchBar";
import PostList from "./PostList";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default function LostFoundDashboardContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [lostItemsSelected, setLostItemsSelected] = useState<boolean>(
        searchParams.get("tab") === "lost"
    );
    const [filteredItems, setFilteredItems] = useState<PlainItem[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<LostItemPost[]>([]);
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const {
        data: items,
        error: itemsError,
        isLoading: itemsLoading,
    } = useSWR<PlainItem[]>("/api/item", fetcher);

    const {
        data: lostItemPosts,
        error: lostItemsError,
        isLoading: lostItemsLoading,
    } = useSWR<LostItemPost[]>("/api/lost-item-post", fetcher);

    // Reset filtered items when data or tab changes
    useEffect(() => {
        if (items) {
            setFilteredItems(items);
        }
        if (lostItemPosts) {
            setFilteredPosts(lostItemPosts);
        }
        const currentTab = searchParams.get("tab");
        const newTab = lostItemsSelected ? "lost" : "found";
        if (currentTab !== newTab) {
            router.replace(`?tab=${newTab}`);
        }
    }, [items, lostItemPosts, lostItemsSelected, router, searchParams]);

    return (
        <div>
            <div className="flex flex-col justify-start align-middle w-full">
                <div className="sticky top-0 z-10 bg-white">
                    <LostFoundSelector
                        lostItemsSelected={lostItemsSelected}
                        setLostItemsSelected={setLostItemsSelected}
                    />
                    {lostItemsSelected ? (
                        <div className="flex gap-2 p-4 bg-white shadow-md rounded-lg sticky top-0">
                            <SearchBar<LostItemPost>
                                placeholder="Search by title or description"
                                items={lostItemPosts || []}
                                setFilteredItems={setFilteredPosts}
                                searchableFields={[
                                    "title",
                                    "description",
                                    "lastSeen",
                                    "category",
                                ]}
                            />
                            <Link href="post">
                                <button className="px-6 py-2 bg-buzz-gold rounded-full text-white flex items-center gap-2">
                                    <FaPlus /> Post
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="p-4 bg-white shadow-md rounded-lg">
                            <SearchBar<PlainItem>
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

                <div>
                    {itemsLoading || lostItemsLoading ? (
                        <div className="p-5">Loading...</div>
                    ) : itemsError || lostItemsError || !items ? (
                        <div className="p-5">Error loading items</div>
                    ) : lostItemsSelected ? (
                        <PostList
                            lostItemPosts={filteredPosts}
                        />
                    ) : (
                        <ItemList items={filteredItems} />
                    )}
                </div>
            </div>
        </div>
    );
}

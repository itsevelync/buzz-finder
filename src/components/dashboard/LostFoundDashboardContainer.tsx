"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LostFoundSelector from "./LostFoundSelector";
import { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";
import ItemList from "./ItemList";
import PostList from "./PostList";
import SearchFilters from "../search/SearchFilters";
import { usePostAndItem } from "@/context/PostAndItemContext";

export default function LostFoundDashboardContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [lostItemsSelected, setLostItemsSelected] = useState<boolean>(
        searchParams.get("tab") === "lost",
    );

    const [searchedPosts, setSearchedPosts] = useState<LostItemPost[]>([]);
    const [displayPosts, setDisplayPosts] = useState<LostItemPost[]>([]);

    const [searchedItems, setSearchedItems] = useState<PlainItem[]>([]);
    const [displayItems, setDisplayItems] = useState<PlainItem[]>([]);

    const { items, lostItemPosts, loading, error } = usePostAndItem();

    useEffect(() => {
        setSearchedItems(items);
        setDisplayItems(items);
    }, [items]);

    useEffect(() => {
        setSearchedPosts(lostItemPosts);
        setDisplayPosts(lostItemPosts);
    }, [lostItemPosts]);

    useEffect(() => {
        const currentTab = searchParams.get("tab");
        const newTab = lostItemsSelected ? "lost" : "found";

        if (currentTab !== newTab) {
            router.replace(`?tab=${newTab}`);
        }
    }, [lostItemsSelected, router, searchParams]);

    return (
        <>
            <div className="flex flex-col w-full">
                <LostFoundSelector
                    lostItemsSelected={lostItemsSelected}
                    setLostItemsSelected={setLostItemsSelected}
                />

                {/* Filters */}
                <div className="sticky top-0 z-10 bg-white">
                    <div className="bg-white shadow-md rounded-lg w-full">
                        {lostItemsSelected ? (
                            <SearchFilters<LostItemPost>
                                items={lostItemPosts}
                                searchedItems={searchedPosts}
                                setSearchedItems={setSearchedPosts}
                                setFilteredItems={setDisplayPosts}
                                displayItems={displayPosts}
                                setDisplayItems={setDisplayPosts}
                                searchableFields={[
                                    "name",
                                    "description",
                                    "locationDescription",
                                ]}
                                searchPlaceholder="Search lost items"
                                isLostItemPost
                            />
                        ) : (
                            <SearchFilters<PlainItem>
                                items={items}
                                searchedItems={searchedItems}
                                setSearchedItems={setSearchedItems}
                                setFilteredItems={setDisplayItems}
                                displayItems={displayItems}
                                setDisplayItems={setDisplayItems}
                                searchableFields={[
                                    "name",
                                    "description",
                                    "locationDescription",
                                ]}
                                searchPlaceholder="Search found items"
                                showSavedSearches
                            />
                        )}
                    </div>
                </div>

                {/* Feed */}
                <div>
                    {loading ? (
                        <div className="p-5">Loading...</div>
                    ) : error ? (
                        <div className="p-5">Error loading items</div>
                    ) : lostItemsSelected ? (
                        <PostList lostItemPosts={displayPosts} columns={2} />
                    ) : (
                        <ItemList items={displayItems} />
                    )}
                </div>
            </div>
        </>
    );
}

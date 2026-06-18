"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LostFoundSelector from "./LostFoundSelector";
import { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";
import ItemList from "./ItemList";
import PostList from "./PostList";
import SearchFilters from "../ui/SearchFilters";
import { archiveOldItems } from "@/actions/ItemFilter";

export default function LostFoundDashboardContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [lostItemsSelected, setLostItemsSelected] = useState<boolean>(
        searchParams.get("tab") === "lost",
    );

    const [items, setItems] = useState<PlainItem[]>([]);
    const [lostItemPosts, setLostItemPosts] = useState<LostItemPost[]>([]);

    const [searchedPosts, setSearchedPosts] = useState<LostItemPost[]>([]);
    const [displayPosts, setDisplayPosts] = useState<LostItemPost[]>([]);

    const [searchedItems, setSearchedItems] = useState<PlainItem[]>([]);
    const [displayItems, setDisplayItems] = useState<PlainItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const [itemsRes, postsRes] = await Promise.all([
                    fetch("/api/items"),
                    fetch("/api/lost-item-posts"),
                ]);

                if (!itemsRes.ok || !postsRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [itemsData, postsData] = await Promise.all([
                    itemsRes.json(),
                    postsRes.json(),
                ]);

                const items = archiveOldItems(itemsData);
                const posts = postsData;

                setItems(items);
                setLostItemPosts(posts);

                setSearchedPosts(posts);
                setDisplayPosts(posts);

                setSearchedItems(items);
                setDisplayItems(items);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const currentTab = searchParams.get("tab");
        const newTab = lostItemsSelected ? "lost" : "found";

        if (currentTab !== newTab) {
            router.replace(`?tab=${newTab}`);
        }
    }, [lostItemsSelected, router, searchParams]);

    return (
        <div>
            <div className="flex flex-col justify-start align-middle w-full">
                <LostFoundSelector
                    lostItemsSelected={lostItemsSelected}
                    setLostItemsSelected={setLostItemsSelected}
                />
                <div className="sticky top-0 z-10 bg-white">
                    {lostItemsSelected ? (
                        <div className="bg-white shadow-md rounded-lg w-full">
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
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg w-full">
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
                                    "retrievalDescription",
                                    "locationDescription",
                                ]}
                                searchPlaceholder="Search found items"
                            />
                        </div>
                    )}
                </div>

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
        </div>
    );
}

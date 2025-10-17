"use client";

import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import { Item } from "@/model/Item";
import FoundItemCard from "../dashboard/FoundItemCard";
import SearchBar from "../ui/SearchBar";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useState } from "react";

export default function ItemSidebar({
    items,
    filteredItems,
    setFilteredItems,
}: {
    items: Item[];
    filteredItems: Item[];
    setFilteredItems: (items: Item[]) => void;
}) {
    const [collapsed, setCollapsed] = useState(false);

    const { setLocation } = useLocation();
    const { setSelectedId } = useSelectedPin();

    return (
        <div className="flex h-full items-center ">
            <div
                className={`h-full flex flex-col transition-all duration-400 overflow-hidden max-w-[90vw] ${
                    collapsed ? "w-0" : "w-xs"
                } border-r border-gray-300`}
            >
                <div className="p-5 shadow top-0 sticky bg-white">
                    <SearchBar<Item>
                        placeholder="Search items"
                        items={items}
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
                <div className="grow flex flex-col gap-3 p-5 overflow-y-auto">
                    {filteredItems.map((item) => (
                        <div
                            key={item._id.toString()}
                            className="cursor-pointer"
                            onClick={() => {
                                if (item.position) {
                                    setLocation(item.position);
                                }
                                setSelectedId(item._id.toString());
                            }}
                        >
                            <FoundItemCard
                                key={item._id.toString()}
                                item={item}
                                includeMapLink={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center hover:brightness-97 transition-all text-gray-500 cursor-pointer -mr-3 z-100 w-3 h-15 rounded-r border-y border-r border-gray-300 bg-white"
            >
                {collapsed ? <FaCaretRight /> : <FaCaretLeft />}
            </div>
        </div>
    );
}

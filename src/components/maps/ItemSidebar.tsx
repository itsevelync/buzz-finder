"use client";

import { PlainItem } from "@/model/Item";
import { useState, Dispatch, SetStateAction } from "react";
import { useIsMobile } from "@/hooks/IsMobile";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

interface ItemSidebarProps {
    items: PlainItem[];
    setFilteredItems: Dispatch<SetStateAction<PlainItem[]>>;
    height: number;
    setHeight: Dispatch<SetStateAction<number>>;
}

export default function ItemSidebar({
    items,
    setFilteredItems,
    height,
    setHeight,
}: ItemSidebarProps) {
    const isMobile = useIsMobile(640);

    const [searchedItems, setSearchedItems] = useState<PlainItem[]>(items);
    const [displayItems, setDisplayItems] = useState<PlainItem[]>(items);

    if (!isMobile) {
        return (
            <DesktopSidebar
                items={items}
                setFilteredItems={setFilteredItems}
                searchedItems={searchedItems}
                setSearchedItems={setSearchedItems}
                displayItems={displayItems}
                setDisplayItems={setDisplayItems}
            />
        );
    }

    return (
        <MobileSidebar
            items={items}
            setFilteredItems={setFilteredItems}
            searchedItems={searchedItems}
            setSearchedItems={setSearchedItems}
            displayItems={displayItems}
            setDisplayItems={setDisplayItems}
            height={height}
            setHeight={setHeight}
        />
    );
}

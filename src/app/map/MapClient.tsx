"use client";

import GoogleMap from "@/components/maps/GoogleMap";
import ItemSidebar from "@/components/maps/ItemSidebar";
import type { PlainItem } from "@/model/Item";
import { useState } from "react";
import { LocationProvider } from "@/context/LocationContext";
import { SelectedPinProvider } from "@/context/PinContext";

export default function MapClient({
    itemId,
    items,
}: {
    itemId: string;
    items: PlainItem[];
}) {
    const [filteredItems, setFilteredItems] = useState<PlainItem[]>(items);

    // Sidebar mobile height
    const [height, setHeight] = useState(93);

    return (
        
            <LocationProvider>
                <SelectedPinProvider defaultSelectedId={itemId}>
                    <div className="w-full h-full flex relative overflow-hidden">
                    <ItemSidebar
                        items={items}
                        setFilteredItems={setFilteredItems}
                        height={height}
                        setHeight={setHeight}
                    />
                    <GoogleMap
                        width="100%"
                        height="100%"
                        items={filteredItems}
                        setHeight={setHeight}
                    />
                    </div>
                </SelectedPinProvider>
            </LocationProvider>
    );
}

"use client";

import GoogleMap from "@/components/maps/GoogleMap";
import ItemSidebar from "@/components/maps/ItemSidebar";
import type { Item } from "@/model/Item";
import { useState } from "react";
import { LocationProvider } from '@/context/LocationContext';
import { SelectedPinProvider } from '@/context/PinContext';

export default function MapClient({
    itemId,
    items,
}: {
    itemId: string;
    items: Item[];
}) {
    const [filteredItems, setFilteredItems] = useState<Item[]>(items);

    return (
        <div className="w-full h-full flex">
            <LocationProvider>
                <SelectedPinProvider defaultSelectedId={itemId}>
                    <ItemSidebar
                        items={items}
                        filteredItems={filteredItems}
                        setFilteredItems={setFilteredItems}
                    />
                    <GoogleMap
                        width="100%"
                        height="100%"
                        defaultMarkerId={itemId}
                        items={filteredItems}
                    />
                </SelectedPinProvider>
            </LocationProvider>
        </div>
    );
}

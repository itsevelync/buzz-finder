"use client";

import GoogleMap from "@/components/maps/GoogleMap";
import ItemSidebar from "@/components/maps/ItemSidebar";
import type { Item } from "@/model/Item";
import { useState } from "react";
import { LocationProvider } from '@/context/LocationContext';
import { SelectedPinProvider } from '@/context/PinContext';
import { useIsMobile } from "@/components/ui/IsMobile";

const MOBILE_WIDTH = 600;

export default function MapClient({
    itemId,
    items,
}: {
    itemId: string;
    items: Item[];
}) {
    const [filteredItems, setFilteredItems] = useState<Item[]>(items);
    const isMobile = useIsMobile(600);

    return (
        <div className="w-full h-full flex">
            <LocationProvider>
                <SelectedPinProvider defaultSelectedId={itemId}>
                    {!isMobile && <ItemSidebar
                        items={items}
                        filteredItems={filteredItems}
                        setFilteredItems={setFilteredItems}
                    />}
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

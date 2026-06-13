"use client";

import GoogleMap from "@/components/maps/GoogleMap";
import ItemSidebar from "@/components/maps/ItemSidebar";
import type { PlainItem } from "@/model/Item";
import { useState } from "react";
import { LocationProvider } from "@/context/LocationContext";
import { SelectedPinProvider } from "@/context/PinContext";
import { useIsMobile } from "@/hooks/IsMobile";

export default function MapClient({
    itemId,
    items,
}: {
    itemId: string;
    items: PlainItem[];
}) {
    const [filteredItems, setFilteredItems] = useState<PlainItem[]>(items);
    const isMobile = useIsMobile(600);

    const [currentPosition, setCurrentPosition] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    return (
        <div className="w-full h-full flex">
            <LocationProvider>
                <SelectedPinProvider defaultSelectedId={itemId}>
                    {!isMobile && (
                        <ItemSidebar
                            items={items}
                            filteredItems={filteredItems}
                            setFilteredItems={setFilteredItems}
                            currentPosition={currentPosition}
                        />
                    )}
                    <GoogleMap
                        width="100%"
                        height="100%"
                        items={filteredItems}
                        currentPosition={currentPosition}
                        setCurrentPosition={setCurrentPosition}
                    />
                </SelectedPinProvider>
            </LocationProvider>
        </div>
    );
}

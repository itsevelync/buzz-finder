"use client";

import GoogleMap from "@/components/maps/GoogleMap";
import ItemSidebar from "@/components/maps/ItemSidebar";
import type { PlainItem } from "@/model/Item";
import { useEffect, useMemo, useState } from "react";
import { LocationProvider } from "@/context/LocationContext";
import { SelectedPinProvider } from "@/context/PinContext";
import { usePostAndItem } from "@/context/PostAndItemContext";
import { getActiveItems } from "@/actions/ItemFilter";
import Loading from "../loading";

export default function MapClient({ itemId }: { itemId: string }) {
    const { items } = usePostAndItem();
const activeItems = useMemo(
    () => getActiveItems(items),
    [items]
);

    const [filteredItems, setFilteredItems] =
        useState<PlainItem[]>(activeItems);

        useEffect(() => {
    setFilteredItems(activeItems);
}, [activeItems]);

    // Sidebar mobile height
    const [vh, setVh] = useState(0);
    const SNAP = {
        COLLAPSED: 93,
        FULL: vh - 162,
    };
    const [height, setHeight] = useState(SNAP.COLLAPSED);

    useEffect(() => {
        setVh(window.innerHeight);
    }, []);

    if (!items.length) return <Loading />;

    return (
        <LocationProvider>
            <SelectedPinProvider defaultSelectedId={itemId}>
                <div className="w-full h-full flex relative overflow-hidden">
                    <ItemSidebar
                        items={activeItems}
                        setFilteredItems={setFilteredItems}
                        height={height}
                        setHeight={setHeight}
                        SNAP={SNAP}
                    />
                    <GoogleMap
                        width="100%"
                        height="100%"
                        items={filteredItems}
                        setHeight={setHeight}
                        SNAP={SNAP}
                    />
                </div>
            </SelectedPinProvider>
        </LocationProvider>
    );
}

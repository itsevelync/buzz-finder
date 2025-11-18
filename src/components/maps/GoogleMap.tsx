"use client";

import MapPanController from "./MapPanController";
import { PlainItem } from "@/model/Item";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import SmallAdvancedMarker from "./SmallAdvancedMarker";

const gtCampus = { lat: 33.7765, lng: -84.398 };

/**
 *
 * Call this Google Maps component to display google map with every missing item
 * Pins to each item will be clickable --> displays image and info about item
 *
 * @param props height: height of component, width: width of component. This should be the same syntax as CSS / Tailwind CSS
 * @returns View of Google Map
 */
export default function GoogleMap(props: {
    height: string | number;
    width: string | number;
    items: PlainItem[];
}) {
    const { setLocation } = useLocation();
    const { selectedId, setSelectedId } = useSelectedPin();

    const selectedItem: PlainItem | undefined = props.items.find(
        (item) => item._id.toString() === selectedId
    );

    useEffect(() => {
        if (selectedItem?.position) {
            setLocation({lat: selectedItem.position.lat + 0.0005,
                lng: selectedItem.position.lng});
        }
    }, [selectedItem, setLocation]);

    const [mapCenter] = useState(selectedItem?.position || gtCampus);

    // TODO: ADD FILTERS FOR ITEM PROPERTIES

    //scrolls the item list to the item with the given itemId
    function scrollToItem(itemId: string) {
        const itemElement = document.getElementById(itemId);
        itemElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    //reloads every time openMarkerId changes, which is when a marker is clicked
    useEffect(() => {
        if (selectedId) {
            setTimeout(() => scrollToItem(selectedId), 0);
        }
    }, [selectedId]);

    return (
        <>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <div style={{ height: props.height, width: props.width }}>
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={16}
                        style={{ height: props.height, width: props.width }}
                        // TODO: Figure out what TEMP_MAP_ID actually needs to be
                        mapId="TEMP_MAP_ID?"
                    >
                        <MapPanController />

                        {props.items.map((item) => (
                            <SmallAdvancedMarker
                                key={item._id}
                                item={item}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                onPinClick={() => {
                                    if (selectedId !== item._id) {
                                        setSelectedId(item._id);
                                    }
                                }}
                            />
                        ))}
                    </Map>
                </div>
            </APIProvider>
        </>
    );
}

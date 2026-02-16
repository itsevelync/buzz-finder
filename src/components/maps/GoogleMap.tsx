"use client";

import MapPanController from "./MapPanController";
import { PlainItem } from "@/model/Item";
import { APIProvider, Map, useMap, MapControl, ControlPosition, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import SmallAdvancedMarker from "./SmallAdvancedMarker";
import { MdMyLocation } from "react-icons/md";
import Image from "next/image";


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
            setLocation({
                lat: selectedItem.position.lat + 0.0005,
                lng: selectedItem.position.lng,
            });
        }
    }, [selectedItem, setLocation]);

    const [mapCenter] = useState({
        lat: selectedItem?.position.lat
            ? selectedItem.position.lat + 0.0005
            : gtCampus.lat,
        lng: selectedItem?.position.lng || gtCampus.lng,
    });

    // Fetch user's current position
    const [currentPosition, setCurrentPosition] = useState<{
        lat: number;
        lng: number;
    }>(gtCampus);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting current location", error);
                }
            );
        }
    }, []);

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
                        defaultCenter={currentPosition}
                        defaultZoom={18}
                        style={{ height: props.height, width: props.width }}
                        // TODO: Figure out what TEMP_MAP_ID actually needs to be
                        mapId="TEMP_MAP_ID?"
                    >
                        <MapPanController />

                        {currentPosition && (
                            <AdvancedMarker position={currentPosition}>
                                <Image
                                    src="/map-pin.svg"
                                    width={35}
                                    height={50}
                                    alt="Current Location Pin"
                                />
                            </AdvancedMarker>
                        )}

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
                        <CurrentLocationButton currentPosition={currentPosition} />
                    </Map>
                </div>
            </APIProvider>
        </>
    );
}

function CurrentLocationButton({currentPosition}: {
    currentPosition: { lat: number; lng: number };
}) {
    const map = useMap();

    function handleCenterClick() {
        if (!map) return;
        map.panTo(currentPosition);

        if (map.getZoom() !== 18) {
            map.setZoom(18);
        }
    }

    return (
        <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <button
                type="button"
                onClick={handleCenterClick}
                className="cursor-pointer mr-2.5 mb-2.5 flex items-center justify-center text-2xl rounded-full w-10 h-10 bg-white shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.3)] text-black/60 hover:bg-gray-50 transition-colors"
                aria-label="Center map on current location"
                title="Center map on current location"
            >
                <MdMyLocation />
            </button>
        </MapControl>
    );
}
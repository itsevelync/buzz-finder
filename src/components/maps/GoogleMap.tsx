"use client";

import MapPanController from "./MapPanController";
import { PlainItem } from "@/model/Item";
import {
    APIProvider,
    Map,
    useMap,
    MapControl,
    ControlPosition,
    AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";
import SmallAdvancedMarker from "./SmallAdvancedMarker";
import { MdMyLocation } from "react-icons/md";
import { MarkerClusterer, Renderer } from "@googlemaps/markerclusterer";

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
    currentPosition: {
        lat: number;
        lng: number;
    } | null;
    setCurrentPosition: Dispatch<
        SetStateAction<{
            lat: number;
            lng: number;
        } | null>
    >;
}) {
    const { setLocation } = useLocation();
    const { selectedId, setSelectedId } = useSelectedPin();

    const selectedItem: PlainItem | undefined = props.items.find(
        (item) => item._id.toString() === selectedId,
    );

    const [iconView, setIconView] = useState(true);
    const [markersById, setMarkersById] = useState<
        Record<string, google.maps.marker.AdvancedMarkerElement>
    >({});

    const clusterableMarkers = useMemo(
        () => Object.values(markersById),
        [markersById],
    );

    const handleMarkerLoad = useCallback(
        (
            marker: google.maps.marker.AdvancedMarkerElement | null,
            itemId: string,
        ) => {
            setMarkersById((previousMarkers) => {
                if (marker) {
                    if (previousMarkers[itemId] === marker) {
                        return previousMarkers;
                    }

                    return {
                        ...previousMarkers,
                        [itemId]: marker,
                    };
                }

                if (!previousMarkers[itemId]) {
                    return previousMarkers;
                }

                const nextMarkers = { ...previousMarkers };
                delete nextMarkers[itemId];
                return nextMarkers;
            });
        },
        [],
    );

    useEffect(() => {
        if (selectedItem?.locationPin) {
            setLocation({
                lat: selectedItem.locationPin.lat + 0.0005,
                lng: selectedItem.locationPin.lng,
            });
        }
    }, [selectedItem, setLocation]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    props.setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting current location", error);

                    // fallback
                    props.setCurrentPosition(gtCampus);
                },
            );
        } else {
            props.setCurrentPosition(gtCampus);
        }
    }, [props]);

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

    if (!props.currentPosition) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                Loading map...
            </div>
        );
    }

    return (
        <>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <div style={{ height: props.height, width: props.width }}>
                    <Map
                        defaultCenter={props.currentPosition}
                        defaultZoom={16}
                        style={{ height: props.height, width: props.width }}
                        // TODO: Figure out what TEMP_MAP_ID actually needs to be
                        mapId="TEMP_MAP_ID?"
                        mapTypeControl={false}
                    >
                        <MapPanController />

                        <MapControl position={ControlPosition.TOP_LEFT}>
                            <div className="ml-3 mt-3 flex rounded bg-white shadow-md overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setIconView(true)}
                                    className={`px-4 py-2 text-base font-medium transition-colors ${
                                        iconView
                                            ? "bg-buzz-blue text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Icons
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIconView(false)}
                                    className={`px-4 py-2 text-base font-medium transition-colors ${
                                        !iconView
                                            ? "bg-buzz-blue text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Images
                                </button>
                            </div>
                        </MapControl>

                        {props.currentPosition != gtCampus && (
                            <AdvancedMarker position={props.currentPosition}>
                                <div className="w-3.5 h-3.5 rounded-full outline-5 outline-blue-400/30 bg-blue-500 border-2 border-white"></div>
                            </AdvancedMarker>
                        )}

                        {props.items.map((item) => (
                            <SmallAdvancedMarker
                                key={item._id}
                                item={item}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                onMarkerLoad={handleMarkerLoad}
                                onPinClick={() => {
                                    if (selectedId !== item._id) {
                                        setSelectedId(item._id);
                                    }
                                }}
                                iconView={iconView}
                            />
                        ))}

                        <MapMarkerClusterer markers={clusterableMarkers} />
                        <CurrentLocationButton
                            currentPosition={props.currentPosition}
                        />
                    </Map>
                </div>
            </APIProvider>
        </>
    );
}

function MapMarkerClusterer({
    markers,
}: {
    markers: google.maps.marker.AdvancedMarkerElement[];
}) {
    const map = useMap();
    const clustererRef = useRef<MarkerClusterer | null>(null);

    const clusterRenderer: Renderer = useMemo(
        () => ({
            render: ({ count, position }) => {
                const buzzBlue =
                    getComputedStyle(document.documentElement)
                        .getPropertyValue("--buzz-blue")
                        .trim() || "#003057";

                const svg = window.btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="26" fill="${buzzBlue}" opacity="0.25" />
                        <circle cx="30" cy="30" r="20" fill="${buzzBlue}" opacity="0.85" />
                        <circle cx="30" cy="30" r="14" fill="${buzzBlue}" />
                    </svg>
                `);

                return new google.maps.Marker({
                    position,
                    icon: {
                        url: `data:image/svg+xml;base64,${svg}`,
                        scaledSize: new google.maps.Size(52, 52),
                    },
                    label: {
                        text: String(count),
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: "700",
                    },
                    zIndex: 1000 + count,
                });
            },
        }),
        [],
    );

    useEffect(() => {
        if (!map) return;

        if (!clustererRef.current) {
            clustererRef.current = new MarkerClusterer({
                map,
                renderer: clusterRenderer,
            });
        }

        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markers);

        return () => {
            clustererRef.current?.clearMarkers();
        };
    }, [clusterRenderer, map, markers]);

    useEffect(() => {
        return () => {
            clustererRef.current?.setMap(null);
            clustererRef.current = null;
        };
    }, []);

    return null;
}

function CurrentLocationButton({
    currentPosition,
}: {
    currentPosition: { lat: number; lng: number };
}) {
    const map = useMap();

    function handleCenterClick() {
        if (!map) return;
        map.panTo(currentPosition);

        if (map.getZoom() !== 16) {
            map.setZoom(16);
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

"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

const gtCampus = { lat: 33.778, lng: -84.398 };

export default function DropPin(props: {
    height: string | number;
    width: string | number;
}) {
    const [pinLocation, setPinLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPinLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting user's location:", error);
                    setPinLocation(gtCampus); // Fallback to default
                }
            );
        } else {
            console.error("Geolocation not supported! Centering on GT campus!");
            setPinLocation(gtCampus); // Fallback to default
        }
    }, []);

    const handleDragEnd = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            console.log("Pin moved to:", newPosition);
            setPinLocation(newPosition);
        }
    };

    const handleSaveLocation = () => {
        if (pinLocation) {
            // TODO: Save to API
            alert(
                `Location Saved!\nLatitude: ${pinLocation.lat}\nLongitude: ${pinLocation.lng}`
            );
        } else {
            alert("No location to save.");
        }
    };

    if (!pinLocation) {
        return <div>Loading map...</div>;
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div>
                <div style={{ height: props.height, width: props.width }}>
                    <Map
                        defaultCenter={pinLocation}
                        defaultZoom={17}
                        // TODO: Figure out what TEMP_MAP_ID actually needs to be
                        mapId="TEMP_MAP_ID?"
                        gestureHandling={"greedy"}
                    >
                        <AdvancedMarker
                            position={pinLocation}
                            draggable={true}
                            onDragEnd={handleDragEnd}
                        />
                    </Map>
                </div>
                <div className="flex justify-center">
                    <button
                        className="align:center mt-3 rounded-lg px-4 py-2 hover:bg-gray-700 border border-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onClick={handleSaveLocation}
                    >
                        Save Pin Location
                    </button>
                </div>
            </div>
        </APIProvider>
    );
}

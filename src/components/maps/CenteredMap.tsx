"use client";

import { PlainItem } from "@/model/Item";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import CustomAdvancedMarker from "./CustomAdvancedMarker";
import { MdMyLocation } from "react-icons/md";
import { LostItemPost } from "@/model/LostItemPost";

/**
 *
 * Displays a Google Map centered on the given pin.
 *
 * @param props.height, props.width - CSS/Tailwind style size values
 * @param props.pin - the Item with a `.locationPin` { lat, lng }
 */
export default function CenteredMap({
    height,
    width,
    pin,
    disableHover = false,
    disableClick = disableHover,
}: {
    height: string;
    width: string;
    pin: PlainItem | LostItemPost;
    disableHover?: boolean;
    disableClick?: boolean;
}) {
    if (!pin) {
        return <div>Item not found!</div>;
    }

    return (
        <div className="custom-marker w-full h-full relative">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <MapWrapper
                    height={height}
                    width={width}
                    pin={pin}
                    disableHover={disableHover}
                    disableClick={disableClick}
                />
            </APIProvider>
        </div>
    );
}

/**
 * Dev Note: useMap() only works inside an <APIProvider> context
 */
function MapWrapper({
    height,
    width,
    pin,
    disableHover,
    disableClick,
}: {
    height: string;
    width: string;
    pin: PlainItem | LostItemPost;
    disableHover: boolean;
    disableClick: boolean;
}) {
    const mapRef = useMap();

    const handleCenterClick = () => {
        if (mapRef && pin?.locationPin) {
            mapRef.panTo(pin.locationPin);
            mapRef.setZoom(17);
        }
    };

    const gtCampus = { lat: 33.778, lng: -84.398 };

    return (
        <div style={{ height, width }}>
            <Map
                defaultCenter={pin.locationPin ?? gtCampus}
                defaultZoom={17}
                mapId="TEMP_MAP_ID?"
                disableDefaultUI={true}
            >
                <CustomAdvancedMarker item={pin} disableHover={disableHover} disableClick={disableClick} />
            </Map>

            {/* Floating re-center button */}
            <div className="absolute group bottom-3 right-2">
                <button
                    onClick={handleCenterClick}
                    className="cursor-pointer hover:brightness-95 transition-all flex items-center justify-center text-2xl rounded-full w-10 h-10 bg-white border shadow border-gray-300"
                    aria-label="Center map on item"
                >
                    <MdMyLocation />
                </button>
                <span className="tooltip tooltip-left">Center Item on Map</span>
            </div>
        </div>
    );
}

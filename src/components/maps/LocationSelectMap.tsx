import {
    APIProvider,
    Map,
    MapCameraChangedEvent,
    useMap,
    MapControl,
    ControlPosition,
} from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction } from "react";
import { MdMyLocation } from "react-icons/md";
import { categories } from "@/constants/Categories";
import StaticCategoryMarker from "./StaticCategoryMarker";

interface LocationSelectMapProps {
    height: number | string;
    width: number | string;
    selectedLocation: { lat: number; lng: number };
    setSelectedLocation: Dispatch<SetStateAction<{ lat: number; lng: number }>>;
    currentPosition: { lat: number; lng: number };
    category?: keyof typeof categories | "";
}

export default function LocationSelectMap(props: LocationSelectMapProps) {
    function handleCameraChange(event: MapCameraChangedEvent) {
        const lat = event.detail.center.lat;
        const lng = event.detail.center.lng;
        props.setSelectedLocation({ lat, lng });
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div
                className="w-full"
                style={{ height: props.height, maxWidth: props.width }}
            >
                <Map
                    defaultCenter={props.selectedLocation}
                    defaultZoom={18}
                    mapId="TEMP_MAP_ID?"
                    onCameraChanged={handleCameraChange}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={false}
                    clickableIcons={false}
                >
                    {/* Pin */}
                    <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2">
                        <StaticCategoryMarker categoryName={props.category} />
                    </div>

                    {/* Button to center on current position */}
                    <CenterButton currentPosition={props.currentPosition} />
                </Map>
            </div>
        </APIProvider>
    );
}

function CenterButton({
    currentPosition,
}: {
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
                className="cursor-pointer mr-2.5 flex items-center justify-center text-2xl rounded-full w-10 h-10 bg-white shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.3)] text-black/60"
                aria-label="Center map on current location"
                title="Center map on current location"
            >
                <MdMyLocation />
            </button>
        </MapControl>
    );
}

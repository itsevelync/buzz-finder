import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction } from 'react'

const LocationSelectMap = (props: { height: number|string, width: number|string, selectedLocation: { lat: number, lng: number }, setSelectedLocation: Dispatch<SetStateAction<{ lat: number; lng: number; }>> }) => {
    function handleMapClick(event: any) {
        const lat = event.detail.latLng.lat;
        const lng = event.detail.latLng.lng;
        props.setSelectedLocation({ lat, lng });
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div className="w-full" style={{ height: props.height, maxWidth: props.width }}>
                <Map
                    defaultCenter={props.selectedLocation}
                    defaultZoom={18}
                    // TODO: Figure out what TEMP_MAP_ID actually needs to be
                    mapId="TEMP_MAP_ID?"
                    onClick={handleMapClick}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={false}
                >
                    <AdvancedMarker
                        position={props.selectedLocation}
                        title={"Your Selected Location"}
                        clickable={true}
                    />
                </Map>
            </div>
        </APIProvider>
    )
}

export default LocationSelectMap

'use client';
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

// TODO: Update to use MongoDB positions
const positions = [
    {id: 1, position: { lat: 33.7780, lng: -84.3980 }, title: "wallet", description: "gucchi wallet", image: "/wallet.png", reportedDate: new Date()},
    {id: 2, position: { lat: 33.7783, lng: -84.3984 }, title: "purse", description: "louis vutton purse", image: "/wallet.png", reportedDate: new Date(new Date().setDate(new Date().getDate() - 1))},
]

/**
 * 
 * Call this component to display map centered on passed in pinID
 * 
 * @param props (height width pinId) height: height of component, width: width of component. 
 * This should be the same syntax as CSS / Tailwind CSS,
 * pinId: the id of the pin the map should be centered on
 * @returns View of Google Map centered on the pin
 */
export default function CenteredMap(props: { height: any; width: any; pinId: any; }) {
    const pin = positions.find(item => item.id == props.pinId);
    
    if (!pin) {
        return <div>Item not found!</div>;
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div style={{height: props.height, width: props.width}}>
                <Map 
                    defaultCenter={pin.position}
                    defaultZoom={17}
                    // TODO: Figure out what TEMP_MAP_ID actually needs to be
                    mapId="TEMP_MAP_ID?"
                >
                <AdvancedMarker 
                    key={pin.id}
                    position={pin.position}
                    title={pin.title}
                    clickable={true} 
                />
                </Map>
            </div>
        </APIProvider>
    );
}
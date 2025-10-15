'use client';
import { Item } from "@/model/Item";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import CustomAdvancedMarker from "./CustomAdvancedMarker";

/**
 * 
 * Call this component to display map centered on passed in pinID
 * 
 * @param props (height width pinId) height: height of component, width: width of component. 
 * This should be the same syntax as CSS / Tailwind CSS,
 * pinId: the id of the pin the map should be centered on
 * @returns View of Google Map centered on the pin
 */
export default function CenteredMap(props: { height: string; width: string; pin: Item; }) {
    
    if (!props.pin) {
        return <div>Item not found!</div>;
    }

    return (
        <div className="custom-marker w-full h-full">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div style={{height: props.height, width: props.width}}>
                <Map 
                    defaultCenter={props.pin.position}
                    defaultZoom={17}
                    // TODO: Figure out what TEMP_MAP_ID actually needs to be
                    mapId="TEMP_MAP_ID?"
                    options={{ disableDefaultUI: true }}
                >
                <CustomAdvancedMarker item={props.pin} />
                </Map>
            </div>
        </APIProvider>
        </div>
    );
}
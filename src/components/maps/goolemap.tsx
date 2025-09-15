'use client';

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function GoogleMap() {
    const position = { lat: 33.7780, lng: -84.3980 };

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div style={{height: '100vh', width: '100%'}}>
                <Map 
                    defaultCenter={position}
                    defaultZoom={15}
                    mapId="tmpMAPiD???"
                >
                    <AdvancedMarker position={position} />
                </Map>
            </div>
        </APIProvider>
    );
}
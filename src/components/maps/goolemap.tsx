'use client';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import React, { useState } from "react";

// TODO: Update to use MongoDB positions
const positions = [
    {id: 1, position: { lat: 33.7780, lng: -84.3980 }, title: "wallet", description: "gucchi wallet", image: "/wallet.png", reportedDate: new Date()},
    {id: 2, position: { lat: 33.7783, lng: -84.3984 }, title: "purse", description: "louis vutton purse", image: "/wallet.png", reportedDate: new Date(new Date().setDate(new Date().getDate() - 1))},
]

const gtCampus = { lat: 33.7780, lng: -84.3980 };

/**
 * 
 * Call this Google Maps component to display google map with every missing item
 * Pins to each item will be clickable --> displays image and info about item
 * 
 * @param props height: height of component, width: width of component. This should be the same syntax as CSS / Tailwind CSS
 * @returns View of Google Map
 */
export default function GoogleMap(props: { height: any; width: any; }) {

    const [openMarkerId, setOpenMarkerId] = useState<number | null>(null);;
    const selectedMarker = positions.find(p => p.id === openMarkerId);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div style={{height: props.height, width: props.width}}>
                <Map 
                    defaultCenter={gtCampus}
                    defaultZoom={15}
                    // TODO: Figure out what TEMP_MAP_ID actually needs to be
                    mapId="TEMP_MAP_ID?"
                >
                    {positions.map(({id, position, title}) => 
                        <AdvancedMarker 
                            key={id}
                            position={position}
                            title={title}
                            clickable={true} 
                            onClick={() => setOpenMarkerId(id)} 
                        />
                    )}

                    {selectedMarker && (
                        <InfoWindow
                            position={selectedMarker.position}
                            onCloseClick={() => setOpenMarkerId(null)}
                        >
                            <div className="p-1 w-64">
                                <img
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                    src={selectedMarker.image}
                                    alt={selectedMarker.title}
                                />
                                <div>
                                    <h2 className="text-lg font-bold capitalize">
                                        {selectedMarker.title}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {selectedMarker.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Reported on: {selectedMarker.reportedDate.toLocaleString()}
                                    </p>
                                </div>
                                
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}
'use client';
import MapPanController from './MapPanController'
import { Item } from "@/model/Item";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useSelectedPin } from "@/context/PinContext";


const gtCampus = { lat: 33.7780, lng: -84.3980 };

/**
 * 
 * Call this Google Maps component to display google map with every missing item
 * Pins to each item will be clickable --> displays image and info about item
 * 
 * @param props height: height of component, width: width of component. This should be the same syntax as CSS / Tailwind CSS
 * @returns View of Google Map
 */
export default function GoogleMap(props: { height: any; width: any; defaultMarkerId:string|null,items:Item[] }) {

    const { setLocation } = useLocation();
    const { selectedId, setSelectedId } = useSelectedPin();

    const selectedItem:Item|undefined = props.items.find(item => item._id.toString() === selectedId);
    const initialItem = props.items.find(item => item._id.toString() === props.defaultMarkerId);

    const [mapCenter] = useState(selectedItem?.position || gtCampus);
    const [zoom] = useState(1);

    // TODO: ADD FILTERS FOR ITEM PROPERTIES

    //scrolls the item list to the item with the given itemId
    function scrollToItem(itemId:string){
        const itemElement = document.getElementById(''+itemId);
        itemElement?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    //reloads every time openMarkerId changes, which is when a marker is clicked 
    useEffect(() => {     
        if (selectedId) {
            setTimeout(()=>scrollToItem(selectedId.toString()),0);
        }
    }, [selectedId]);

    return (
        <>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div style={{height: props.height, width: props.width}}>
                <Map 
                    defaultCenter={mapCenter}
                    defaultZoom={zoom}
                    style={{height: props.height, width: props.width}}
                    // TODO: Figure out what TEMP_MAP_ID actually needs to be
                    mapId="TEMP_MAP_ID?"
                >
                    <MapPanController />

                    {props.items.map((item) => 
                        <AdvancedMarker 
                            key={item._id.toString()}
                            position={item.position}
                            title={item.title}
                            clickable={true} 
                            onClick={() => {
                                setLocation(item.position);
                                setSelectedId(item._id.toString());
                            }}
                        />
                    )}
                    

                    {selectedItem && (
                        <InfoWindow
                            position={selectedItem.position}
                            onCloseClick={() => setSelectedId(null)}
                        >
                            <div className="p-1 w-64">
                                <Image
                                    className="w-full h-38 object-cover rounded-lg mb-2"
                                    src={selectedItem.image?.url as string || '/default-item.png'}
                                    alt={selectedItem.title}
                                    width={200}
                                    height={150}
                                />
                                <div>
                                    <h2 className="text-lg font-bold capitalize">
                                        {selectedItem.title}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {selectedItem.item_description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Reported on: {selectedItem.lostdate.toLocaleDateString()}
                                    </p>
                                </div>
                                
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
        </>
    );
}
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { set } from "mongoose";
import React, { Dispatch, SetStateAction } from 'react'

const LocationSelectMap = (props:{height:number,width:number,selectedLocation:{lat:number,lng:number}, setSelectedLocation:Dispatch<SetStateAction<{ lat: number; lng: number; }>>}) => {
    const gtCampus = { lat: 33.7780, lng: -84.3980 };
    function handleMapClick(event:any) {
        const lat = event.detail.latLng.lat;
        const lng = event.detail.latLng.lng;
        props.setSelectedLocation({lat,lng});
    }

  return (
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <div style={{height: props.height, width: props.width}}>
                    <Map 
                        defaultCenter={gtCampus}
                        defaultZoom={15}
                        // TODO: Figure out what TEMP_MAP_ID actually needs to be
                        mapId="TEMP_MAP_ID?"
                        onClick={handleMapClick}
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

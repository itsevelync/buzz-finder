"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useLocation } from "@/context/LocationContext";

export default function MapPanController() {
    const map = useMap();
    const { location } = useLocation();
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (map && location) {
            if (map.getZoom() !== 18) {
                map.setZoom(18);
            }
            map.panTo(location);
        }
    }, [map, location]);

    return null;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Position = {
    lat: number;
    lng: number;
};

type UserLocationContextType = {
    currentPosition: Position | undefined;
    currPositionFetched: boolean;
};

const UserLocationContext = createContext<UserLocationContextType | undefined>(
    undefined,
);

const gtCampus = {
    lat: 33.7756,
    lng: -84.3963,
};

export function UserLocationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [currentPosition, setCurrentPosition] = useState<
        Position | undefined
    >(undefined);
    const [currPositionFetched, setCurrPositionFetched] = useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setCurrentPosition(gtCampus);
            setCurrPositionFetched(true);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setCurrPositionFetched(true);
            },
            (error) => {
                console.log("Error getting location", error);
                setCurrentPosition(gtCampus);
                setCurrPositionFetched(true);
            },
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return (
        <UserLocationContext.Provider
            value={{ currentPosition, currPositionFetched }}
        >
            {children}
        </UserLocationContext.Provider>
    );
}

export function useUserLocation() {
    const context = useContext(UserLocationContext);

    if (!context) {
        throw new Error(
            "useUserLocation must be used within UserLocationProvider",
        );
    }

    return context;
}

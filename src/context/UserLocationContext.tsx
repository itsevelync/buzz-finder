"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Position = {
    lat: number;
    lng: number;
};

type UserLocationContextType = {
    currentPosition: Position | undefined;
    currPositionFetched: boolean;
    currPositionFetchFailed: boolean;
};

const UserLocationContext = createContext<UserLocationContextType | undefined>(
    undefined,
);

const gtCampus = {
    lat: 33.778,
    lng: -84.398,
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
    const [currPositionFetchFailed, setCurrPositionFetchFailed] =
        useState(false);

    useEffect(() => {
        if (!navigator.geolocation) {
            setCurrentPosition(gtCampus);
            setCurrPositionFetchFailed(true);
            setCurrPositionFetched(true);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setCurrPositionFetchFailed(false);
                setCurrPositionFetched(true);
            },
            (error) => {
                console.log("Error getting location", error);
                setCurrentPosition(gtCampus);
                setCurrPositionFetchFailed(true);
                setCurrPositionFetched(true);
            },
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return (
        <UserLocationContext.Provider
            value={{
                currentPosition,
                currPositionFetched,
                currPositionFetchFailed,
            }}
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

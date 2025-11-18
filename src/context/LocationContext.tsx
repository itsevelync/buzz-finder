"use client";
import { createContext, useState, useContext, ReactNode } from "react";

export interface LocationCoords {
    lat: number;
    lng: number;
}

interface LocationContextType {
    location: LocationCoords;
    setLocation: React.Dispatch<React.SetStateAction<LocationCoords>>;
}

const LocationContext = createContext<LocationContextType | undefined>(
    undefined
);

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
    const [location, setLocation] = useState<LocationCoords>({
        lat: 33.778,
        lng: -84.398,
    });

    const value = { location, setLocation };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);

    if (context === undefined) {
        throw new Error("useLocation must be used within LocationProvider");
    }

    return context;
};

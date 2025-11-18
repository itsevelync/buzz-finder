"use client";
import { createContext, useState, useContext, ReactNode } from "react";

export interface LocationCoords {
    lat: number;
    lng: number;
}

interface LocationContextType {
    location: LocationCoords | null;
    setLocation: React.Dispatch<React.SetStateAction<LocationCoords | null>>;
}

const LocationContext = createContext<LocationContextType | undefined>(
    undefined
);

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
    const [location, setLocation] = useState<LocationCoords | null>(null);

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

import { useState, useEffect } from "react";

// Max width before determining if mobile
export function useIsMobile(maxWidth = 600) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            console.log("Setting Inner Width: ", window.innerWidth);
            setIsMobile(window.innerWidth < maxWidth);
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [maxWidth]);

    return isMobile;
}

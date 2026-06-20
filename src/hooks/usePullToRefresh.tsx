import { useEffect, useRef, useState } from "react";

type Options = {
    onRefresh: () => Promise<void> | void;
    pullThreshold?: number;
    maxPull?: number;
};

export function usePullToRefresh({
    onRefresh,
    pullThreshold = 70,
    maxPull = 80,
}: Options) {
    // ===== Pull-to-refresh =====
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    const startYRef = useRef(0);
    const pullingRef = useRef(false);
    const distanceRef = useRef(0);

    // -------------------------
    // Pull-to-refresh logic
    // -------------------------
    useEffect(() => {
        const getScrollTopSafe = () => window.scrollY || 0;

        const onTouchStart = (e: TouchEvent) => {
            if (getScrollTopSafe() > 2) return;

            pullingRef.current = true;
            startYRef.current = e.touches[0].clientY;
            distanceRef.current = 0;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pullingRef.current || isRefreshing) return;

            const diff = e.touches[0].clientY - startYRef.current;

            if (diff > 0) {
                distanceRef.current = Math.min(diff, maxPull);
                setPullDistance(distanceRef.current);
            }
        };

        const onTouchEnd = async () => {
            if (!pullingRef.current) return;

            pullingRef.current = false;

            const shouldRefresh = distanceRef.current > pullThreshold;

            setPullDistance(0);
            distanceRef.current = 0;

            if (shouldRefresh && !isRefreshing) {
                setIsRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                }
            }
        };

        document.addEventListener("touchstart", onTouchStart, {
            passive: true,
        });
        document.addEventListener("touchmove", onTouchMove, {
            passive: true,
        });
        document.addEventListener("touchend", onTouchEnd);

        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, [onRefresh, isRefreshing, pullThreshold, maxPull]);

    return {
        isRefreshing,
        pullDistance,
    };
}

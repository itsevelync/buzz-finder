"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { usePostAndItem } from "@/context/PostAndItemContext";
import { useNotifications } from "@/context/NotificationContext";

const DISABLED_PATHS = ["/map", "/messages/"];

export default function GlobalPullToRefresh({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const { refresh } = usePostAndItem();
    const { refreshNotifications } = useNotifications();

    const disabled = DISABLED_PATHS.some((path) => pathname.startsWith(path));

    const { pullDistance } = usePullToRefresh({
        enabled: !disabled,
        onRefresh: async () => {
            refresh();
            refreshNotifications();
            router.refresh();
        },
    });

    return (
        <>
            {!disabled && (
                <PullToRefreshIndicator pullDistance={pullDistance} />
            )}
            {children}
        </>
    );
}

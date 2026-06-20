type PullToRefreshIndicatorProps = {
    pullDistance: number;
};

export default function PullToRefreshIndicator({
    pullDistance,
}: PullToRefreshIndicatorProps) {
    return (
        <>
            {/* Pull-to-refresh text indicator */}
            <div
                className="flex justify-center items-center transition-all duration-200"
                style={{
                    height: `${pullDistance}px`,
                    opacity: pullDistance / 100,
                }}
            >
                {pullDistance > 70 ? (
                    <div className="animate-spin h-5 w-5 border-2 border-buzz-gold border-t-transparent rounded-full" />
                ) : (
                    <div className="text-xs text-gray-500">Pull to refresh</div>
                )}
            </div>
        </>
    );
}

export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-6 rounded-2xl px-6 py-5">
                <div className="relative">
                    <div className="h-14 w-14 rounded-full border-4 border-foreground/15" />
                    <div className="absolute left-0 top-0 h-14 w-14 animate-spin rounded-full border-4 border-b-buzz-blue border-t-transparent" />
                </div>

                <p className="text-sm opacity-80">Loading...</p>
            </div>
        </div>
    );
}

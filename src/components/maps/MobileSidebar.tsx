import { Dispatch, SetStateAction, useRef, useState } from "react";
import { PlainItem } from "@/model/Item";
import { useSelectedPin } from "@/context/PinContext";
import SearchFilters from "../ui/SearchFilters";
import FoundItemCard from "../dashboard/FoundItemCard";

interface MobileSidebarProps {
    items: PlainItem[];
    setFilteredItems: Dispatch<SetStateAction<PlainItem[]>>;
    searchedItems: PlainItem[];
    setSearchedItems: Dispatch<SetStateAction<PlainItem[]>>;
    displayItems: PlainItem[];
    setDisplayItems: Dispatch<SetStateAction<PlainItem[]>>;
    height: number;
    setHeight: Dispatch<SetStateAction<number>>;
    SNAP: { COLLAPSED: number; FULL: number };
}

export default function MobileSidebar({
    items,
    setFilteredItems,
    searchedItems,
    setSearchedItems,
    displayItems,
    setDisplayItems,
    height,
    setHeight,
    SNAP,
}: MobileSidebarProps) {
    const { setSelectedId } = useSelectedPin();

    const [dragging, setDragging] = useState(false);
    const lastY = useRef(0);
    const lastTime = useRef(0);
    const velocity = useRef(0);

    const didDrag = useRef(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);

    function handleSheetDragStart(e: React.PointerEvent<HTMLDivElement>) {
        const target = e.target as HTMLElement;

        if (target.closest("button") && height === SNAP.FULL) {
            return;
        }
        const el = sheetRef.current;
        if (!el) return;

        setDragging(true);

        el.setPointerCapture(e.pointerId);

        const startY = e.clientY;
        const startHeight = height;

        lastY.current = e.clientY;
        lastTime.current = performance.now();

        const onMove = (ev: PointerEvent) => {
            didDrag.current = true;
            const now = performance.now();
            const dy = ev.clientY - lastY.current;
            const dt = now - lastTime.current;

            velocity.current = dy / dt;

            lastY.current = ev.clientY;
            lastTime.current = now;

            const delta = startY - ev.clientY;

            const newHeight = Math.min(
                Math.max(startHeight + delta, SNAP.COLLAPSED),
                SNAP.FULL,
            );

            setHeight(newHeight);
        };

        const onUp = () => {
            setTimeout(() => {
                didDrag.current = false;
            }, 0);
            setDragging(false);

            el.releasePointerCapture(e.pointerId);

            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerup", onUp);

            // 🔥 FLING + SNAP LOGIC
            const v = velocity.current;

            let target = height;

            const isFastSwipe = Math.abs(v) > 0.5;

            if (isFastSwipe) {
                if (v < 0) {
                    target = SNAP.FULL; // swipe up fast
                } else {
                    target = SNAP.COLLAPSED; // swipe down fast
                }
            } else {
                // nearest snap point
                const points = [SNAP.COLLAPSED, SNAP.FULL];
                target = points.reduce((prev, curr) =>
                    Math.abs(curr - height) < Math.abs(prev - height)
                        ? curr
                        : prev,
                );
            }

            setHeight(target);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerup", onUp);
    }

    return (
        <div
            ref={sheetRef}
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col bg-white border-t border-gray-300 rounded-t-2xl shadow-xl"
            style={{
                height,
                touchAction: "none",
                transition: dragging ? "none" : "height 0.25s ease-out",
            }}
        >
            {/* Drag handle */}
            <div
                onPointerDown={handleSheetDragStart}
                className="py-6 -my-4 h-3 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0"
            >
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div
                onClick={() => {
                    if (didDrag.current) return; // ignore clicks after drag
                    setHeight(SNAP.FULL);
                }}
            >
                <div className="shadow top-0 sticky bg-white z-10">
                    {/* Header (filters/search) */}
                    <SearchFilters<PlainItem>
                        items={items}
                        searchedItems={searchedItems}
                        setSearchedItems={setSearchedItems}
                        setFilteredItems={setFilteredItems}
                        displayItems={displayItems}
                        setDisplayItems={setDisplayItems}
                        searchableFields={[
                            "name",
                            "description",
                            "retrievalDescription",
                            "locationDescription",
                        ]}
                        width={window.innerWidth}
                        isMap
                        mobileSidebarHandleSheetDragStart={handleSheetDragStart}
                        mobileSidebarHeight={height}
                        mobileSidebarSnapFULL={SNAP.FULL}
                    />
                </div>
            </div>

            {/* Scrollable content */}
            <div
                onClick={() => {
                    if (didDrag.current) return; // ignore clicks after drag
                    setHeight(SNAP.COLLAPSED);
                }}
                className={`flex-1 overflow-y-auto grid gap-3 p-4 ${
                    window.innerWidth > 500 ? "grid-cols-2" : "grid-cols-1"
                }`}
            >
                {displayItems.map((item) => (
                    <div
                        key={item._id.toString()}
                        onClick={() => setSelectedId(item._id.toString())}
                    >
                        <FoundItemCard item={item} includeMapLink={false} />
                    </div>
                ))}
            </div>
        </div>
    );
}

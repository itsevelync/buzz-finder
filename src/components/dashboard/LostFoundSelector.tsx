"use client";

/**
 * This component selects between viewing found or lost items.
 */
export default function LostFoundSelector({
    lostItemsSelected,
    setLostItemsSelected,
}: {
    lostItemsSelected: boolean;
    setLostItemsSelected: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <div className="flex justify-center gap-10 mt-4 md:mt-8 mb-1 h-{40px} border-b border-gray-200">
            <div
                className={
                    `text-lg -mb-0.5 border-b-3 p-2 cursor-pointer ${lostItemsSelected
                        ? "border-b-transparent"
                        : "border-b-buzz-gold brightness-130 font-semibold"}`
                }
                onClick={() => setLostItemsSelected(false)}
            >
                <h1>Found Items</h1>
            </div>
            <div
                className={
                    `text-lg -mb-0.5 border-b-3 p-2 cursor-pointer ${lostItemsSelected
                        ? "border-b-buzz-gold brightness-130 font-semibold"
                        : "border-b-transparent"}`
                }
                onClick={() => setLostItemsSelected(true)}
            >
                <h1>Lost Items</h1>
            </div>
        </div>
    );
};
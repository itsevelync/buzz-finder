import { useState, useMemo } from "react";
import { useModal } from "@/context/ModalContext";
import { LuSearch, LuStar, LuX } from "react-icons/lu";
import { usePostAndItem } from "@/context/PostAndItemContext";
import ItemSelectCard from "./ItemSelectCard";

interface MatchItemModalProps {
    mode: "lost" | "found"; // "lost" means matching a lost item post, "found" means matching a found item
    onConfirmMatch: (targetId: string) => void;
}

export default function MatchItemModal({
    mode,
    onConfirmMatch,
}: MatchItemModalProps) {
    const { items, lostItemPosts } = usePostAndItem();
    const { closeModal } = useModal();
    const [selectedId, setSelectedId] = useState("");
    const [search, setSearch] = useState("");

    // Dynamic dataset extraction
    const rawData = mode === "found" ? items : lostItemPosts;

    // Normalize differences into the unified ItemSelectCard interface
    const normalizedItems = useMemo(() => {
        return rawData.map((item) => ({
            _id: item._id,
            name: item.name,
            category: item.category,
            locationDescription: item.locationDescription,
            image: item.image,
            date: item.lostDate || item.createdAt,
            user:
                "personFound" in item
                    ? item.personFound
                    : "user" in item
                      ? item.user
                      : undefined,
        }));
    }, [rawData]);

    const filteredItems = useMemo(() => {
        if (!search.trim()) return normalizedItems;
        return normalizedItems.filter((item) =>
            `${item.name} ${item.locationDescription}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [search, normalizedItems]);

    return (
        <div className="max-h-[80vh] overflow-hidden bg-white rounded-lg w-full p-5 shadow-xl flex flex-col border border-gray-100">
            <div className="flex justify-between items-start pb-2">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    <LuStar className="text-buzz-gold" /> Match With a{" "}
                    {mode === "found" ? "Found" : "Lost"} Item
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1"
                >
                    <LuX />
                </button>
            </div>

            <p className="text-foreground/70 mb-3.5 text-sm">
                Select the match below to link the postings together and notify
                the lost item owner.
            </p>

            <div className="pb-4 relative flex items-center">
                <input
                    type="text"
                    placeholder={`Search ${mode === "found" ? "found" : "lost"} items...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-1.5 pl-9 px-3 rounded-full border border-foreground/25"
                />
                <div className="absolute left-3">
                    <LuSearch />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="italic text-foreground/50 py-1">
                        No items found.
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <ItemSelectCard
                            key={item._id.toString()}
                            item={item}
                            onSelect={() => setSelectedId(item._id.toString())}
                            selected={selectedId === item._id}
                        />
                    ))
                )}
            </div>

            <div className="flex justify-end gap-2.5 pt-5">
                <button
                    className="border border-foreground/20 rounded-md px-4 py-2 text-sm"
                    onClick={closeModal}
                >
                    Cancel
                </button>
                <button
                    className="bg-buzz-blue text-white px-4 py-2 rounded-md font-medium disabled:opacity-40 text-sm"
                    disabled={!selectedId}
                    onClick={() => {
                        onConfirmMatch(selectedId);
                        closeModal();
                    }}
                >
                    Confirm match
                </button>
            </div>
        </div>
    );
}

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import FoundItemSelectCard from "../dashboard/FoundItemSelectCard";
import { useModal } from "@/context/ModalContext";
import { LuSearch, LuStar, LuX } from "react-icons/lu";
import { usePostAndItem } from "@/context/PostAndItemContext";
import { PlainItem } from "@/model/Item";

interface MatchFoundItemModalProps {
    onConfirmMatch: (id: string) => void;
    setMatch: Dispatch<SetStateAction<PlainItem | null>>;
}

export default function MatchFoundItemModal({
    onConfirmMatch,
}: MatchFoundItemModalProps) {
    const { items } = usePostAndItem();
    const { closeModal } = useModal();
    const [selectedId, setSelectedId] = useState("");
    const [search, setSearch] = useState("");

    // Filter found items based on search
    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;

        return items.filter((item) =>
            `${item.name} ${item.description} ${item.locationDescription}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [search, items]);

    const selectedItem = items.find((i) => i._id === selectedId);

    const handleConfirm = () => {
        if (!selectedItem) return;
        onConfirmMatch(selectedItem._id);
        closeModal();
    };

    return (
        <div className="max-h-[80vh] overflow-hidden bg-white rounded-lg w-full p-5 shadow-xl flex flex-col border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-start pb-2">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    <LuStar className="text-buzz-gold" /> Match With a Found
                    Item
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>
            <p className="text-foreground/70 mb-3.5 text-sm">
                Does this lost item match a found item on BuzzFinder? Select the
                item below to match the items and notify the item owner.
            </p>

            {/* Search */}
            <div className="pb-4 relative flex items-center">
                <input
                    type="text"
                    placeholder="Search found items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-1.5 pl-9 px-3 rounded-full border border-foreground/25"
                />
                <div className="absolute left-3">
                    <LuSearch />
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-1 rounded flex-1 space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="italic text-foreground/50 py-1">
                        No found items.
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <FoundItemSelectCard
                            key={item._id}
                            item={item}
                            onSelect={() => setSelectedId(item._id)}
                            selected={selectedId === item._id}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 pt-5">
                <button
                    className="border border-foreground/20 text-foreground-70 font-medium rounded-md px-4 py-2 hover:bg-foreground/3"
                    onClick={closeModal}
                >
                    Cancel
                </button>

                <button
                    className="bg-buzz-blue text-background px-4 py-2 rounded-md cursor-pointer font-medium hover:brightness-125 disabled:opacity-40"
                    disabled={!selectedItem}
                    onClick={handleConfirm}
                >
                    Confirm match
                </button>
            </div>
        </div>
    );
}

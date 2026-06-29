import { useModal } from "@/context/ModalContext";
import { LuCheck, LuStar } from "react-icons/lu";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MatchItemModal from "./MatchItemModal";
import ItemSelectCard from "./ItemSelectCard";
import { LostItemPost } from "@/model/LostItemPost";
import { PlainItem } from "@/model/Item";
import { usePostAndItem } from "@/context/PostAndItemContext";

interface MatchItemProps {
    currentItemId: string;
    mode: "lost" | "found"; // 'found' = matching an external found item (for LostItemClient)
    resolved: boolean;
}

export default function MatchItem({
    currentItemId,
    mode,
    resolved,
}: MatchItemProps) {
    const router = useRouter();
    const { openModal } = useModal();
    const { user } = useUser();
    const { items, lostItemPosts } = usePostAndItem();
    const [match, setMatch] = useState<LostItemPost | PlainItem | null>(null);

    // Endpoint flips depending on where it's embedded
    const queryParam =
        mode === "found"
            ? `lostItemId=${currentItemId}`
            : `foundItemId=${currentItemId}`;

    useEffect(() => {
        async function getMatch() {
            try {
                const res = await fetch(`/api/item-matches?${queryParam}`);
                const body = await res.json();
                if (res.ok) {
                    let matchedItem;
                    if (body) {
                        if (mode === "found") {
                            matchedItem = items.find(
                                (i) => i._id === body.foundItem._id,
                            );
                        } else {
                            matchedItem = lostItemPosts.find(
                                (i) => i._id === body.lostItem._id,
                            );
                        }
                    }
                    setMatch(matchedItem ?? null);
                }
            } catch (err) {
                console.error("Error fetching match data", err);
            }
        }
        getMatch();
    }, [currentItemId, items, lostItemPosts, mode, queryParam]);

    async function handleMatch(targetId: string) {
        try {
            const body = {
                userId: user?._id,
                lostItemId: mode === "found" ? currentItemId : targetId,
                foundItemId: mode === "found" ? targetId : currentItemId,
            };

            const res = await fetch("/api/item-matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const resBody = await res.json();
            if (res.ok) {
                toast.success("Successfully submitted item match!");
                let matchedItem;
                if (mode === "found") {
                    matchedItem = items.find(
                        (i) => i._id === resBody.foundItem._id,
                    );
                } else {
                    matchedItem = lostItemPosts.find(
                        (i) => i._id === resBody.lostItem._id,
                    );
                }
                setMatch(matchedItem ?? null);
            } else {
                toast.error(`Error: ${resBody.error || "Server issue"}`);
            }
        } catch {
            toast.error("Could not confirm match.");
        }
    }

    function openMatchModal() {
        openModal(<MatchItemModal mode={mode} onConfirmMatch={handleMatch} />, {
            maxWidth: "2xl",
        });
    }

    // Convert internal data configurations to standard format for UI Display Card
    const normalizedMatch = match
        ? {
              _id: match._id,
              name: match.name,
              category: match.category,
              locationDescription: match.locationDescription,
              image: match.image,
              date: match.lostDate || match.createdAt,
              user:
                  "personFound" in match
                      ? match.personFound
                      : "user" in match
                        ? match.user
                        : undefined,
          }
        : null;

    return (
        <>
            {(match || !resolved) && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2 w-full">
                    <div className="mb-2 space-y-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <LuStar className="text-buzz-gold" /> Matched{" "}
                            {mode === "found" ? "Found" : "Lost"} Item
                        </h3>
                        {!match && (
                            <p className="text-sm text-foreground/80">
                                {mode === "found"
                                    ? "Did someone find this item? Link it to notify the owner!"
                                    : "Does this item match an existing lost item post? Link it here!"}
                            </p>
                        )}
                    </div>
                    {normalizedMatch ? (
                        <>
                            <ItemSelectCard
                                item={normalizedMatch}
                                onSelect={() =>
                                    router.push(
                                        mode === "found"
                                            ? `/item/${match?._id}`
                                            : `/lost-item/${match?._id}`,
                                    )
                                }
                            />
                            {!resolved && (
                                <button
                                    onClick={openMatchModal}
                                    className="underline text-xs opacity-50 mt-1"
                                >
                                    Change matched item
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={openMatchModal}
                            className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-2.5 rounded-md transition text-sm flex items-center justify-center gap-2"
                        >
                            <LuCheck /> Match With{" "}
                            {mode === "found" ? "Found" : "Lost"} Item
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

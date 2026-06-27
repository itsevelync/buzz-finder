import { useModal } from "@/context/ModalContext";
import { LuCheck, LuStar } from "react-icons/lu";
import MatchFoundItemModal from "./MatchFoundItemModal";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import FoundItemSelectCard from "../dashboard/FoundItemSelectCard";
import { PlainItem } from "@/model/Item";
import { useRouter } from "next/navigation";

interface MatchFoundItemProps {
    lostItemId: string;
}

export default function MatchFoundItem({ lostItemId }: MatchFoundItemProps) {
    const router = useRouter();
    const { openModal } = useModal();
    const { user } = useUser();
    const userId = user?._id;

    const [match, setMatch] = useState<PlainItem | null>(null);

    useEffect(() => {
        async function getMatch() {
            try {
                const res = await fetch(
                    `/api/item-matches?lostItemId=${lostItemId}`,
                );

                const body = await res.json();

                if (res.ok) {
                    setMatch(body.foundItem);
                } else {
                    console.error(body.error);
                }
            } catch (err) {
                console.error(
                    err instanceof Error
                        ? err.message
                        : "Error fetching item match.",
                );
            }
        }
        getMatch();
    }, [lostItemId]);

    async function handleMatch(foundItemId: string) {
        try {
            const body = {
                userId,
                lostItemId,
                foundItemId,
            };

            const res = await fetch("/api/item-matches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const resBody = await res.json();
            if (res.ok) {
                toast.success("Successfully submitted item match!");
                setMatch(resBody.foundItem);
            } else {
                toast.error(
                    `Error submitting item match: ${resBody.error || "Server issue"}`,
                );
            }
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Could not confirm item match. Please try again.",
            );
        }
    }

    function openMatchFoundItemModal() {
        openModal(
            <MatchFoundItemModal
                onConfirmMatch={handleMatch}
                setMatch={setMatch}
            />,
            {
                maxWidth: "2xl",
            },
        );
    }
    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2">
            <div className="mb-2 space-y-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <LuStar className="text-buzz-gold" /> Matched Item
                </h3>
                {!match && (
                    <p className="text-sm text-foreground/80">
                        Did someone already find this item and post it on
                        BuzzFinder? Match it to notify the item owner!
                    </p>
                )}
            </div>
            {match ? (
                <>
                    <FoundItemSelectCard
                        item={match}
                        onSelect={() => router.push(`/item/${match._id}`)}
                    />
                    <button
                        onClick={openMatchFoundItemModal}
                        className="underline text-xs opacity-50"
                    >
                        Change matched item
                    </button>
                </>
            ) : (
                <button
                    onClick={openMatchFoundItemModal}
                    className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-2.5 rounded-md transition text-sm flex items-center justify-center gap-2"
                >
                    <LuCheck /> Match With Found Item
                </button>
            )}
        </div>
    );
}

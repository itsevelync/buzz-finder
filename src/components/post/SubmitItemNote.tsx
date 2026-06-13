"use client";

import { useUser } from "@/context/UserContext";
import { ItemNote } from "@/model/ItemNote";
import { LostItemPost } from "@/model/LostItemPost";
import { useState } from "react";
import { toast } from "react-toastify";

interface SubmitItemNoteProps {
    lost_item: LostItemPost;
    getItemNotes: (itemId: string) => Promise<void>;
}
export default function SubmitItemNote({
    lost_item,
    getItemNotes,
}: SubmitItemNoteProps) {
    const {user} = useUser();
    const [note, setNote] = useState("");
    const [anonymize, setAnonymize] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        setSubmitting(true);

        try {
            const body : Partial<ItemNote> = {
                note: note,
                lostItemId: lost_item._id,
            };

            if (!anonymize && user) {
                body.user = user;
            }

            const res = await fetch("/api/item-notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success("Successfully submitted item note!");
                setNote("");
                getItemNotes(lost_item._id.toString());
            } else {
                const errData = await res.json();
                toast.error(
                    `Error reporting lost item: ${errData.error || "Server issue"}`,
                );
            }
        } catch (err) {
            console.error("Submission network crash:", err);
            toast.error("Network error reporting lost item. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-5">
                <div>
                    <h2 className="text-xl font-bold">
                        Found the item or have potential leads?
                    </h2>

                    <p className="text-sm text-gray-600 mt-2">
                        If you have information about this item, contact the
                        owner directly or leave information about it below.
                    </p>
                </div>

                {/* Recovery Note */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium">New Item Note</label>

                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={5}
                        placeholder="Example: I found this near the Student Center entrance and left it with campus security. Ask for Officer Williams at the front desk."
                        className="w-full rounded-lg border border-gray-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-buzz-blue"
                    />

                    {user?._id && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="anonymize"
                                checked={anonymize}
                                onChange={(e) => {
                                    setAnonymize(e.target.checked);
                                }}
                            />
                            <label
                                htmlFor="anonymize"
                                className="text-sm text-gray-600"
                            >
                                Submit note anonymously
                            </label>
                        </div>
                    )}
                </div>

                <button
                    disabled={submitting || !note.trim()}
                    onClick={handleSubmit}
                    className="w-full bg-buzz-gold text-white py-2 px-4 rounded-full hover:opacity-90 disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit Item Note"}
                </button>
            </div>
        </div>
    );
}

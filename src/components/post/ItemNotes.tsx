import { ItemNote } from "@/model/ItemNote";
import { LuSticker } from "react-icons/lu";

interface ItemNotesProps {
    itemNotes: ItemNote[];
}

export default function ItemNotes({ itemNotes }: ItemNotesProps) {
    return (
        <div>
            <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <LuSticker className="text-buzz-gold" />
                Community Item Notes
            </h3>

            {itemNotes.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {itemNotes.map((note) => (
                        <div
                            key={note._id.toString()}
                            className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                    {note.user?.username ?? "Anonymous"}
                                </span>

                                <span className="text-xs text-gray-500">
                                    {new Date(note.createdAt).toLocaleString(
                                        undefined,
                                        {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        },
                                    )}
                                </span>
                            </div>

                            <p className="text-gray-700 whitespace-pre-wrap">
                                {note.note}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-foreground/2 border border-dashed border-gray-200 rounded-lg p-6 text-center text-foreground/70 shadow">
                    No item notes have been submitted yet. Be the first!
                </div>
            )}
        </div>
    );
}

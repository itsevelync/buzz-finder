import { ItemNote, ItemNoteTree } from "@/model/ItemNote";
import { LuSticker, LuTriangleAlert } from "react-icons/lu";
import { ItemNoteCard } from "./ItemNoteCard";
import { Dispatch, SetStateAction, useState } from "react";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useModal } from "@/context/ModalContext";

interface ItemNotesProps {
    itemNotes: ItemNoteTree[];
    setItemNotes: Dispatch<SetStateAction<ItemNoteTree[]>>;
}

export default function ItemNotes({ itemNotes, setItemNotes }: ItemNotesProps) {
    const { user } = useUser();
    const { openModal, closeModal } = useModal();

    const [editing, setEditing] = useState("");
    const [replying, setReplying] = useState("");
    const [anonymizeReply, setAnonymizeReply] = useState(false);

    const [loading, setLoading] = useState(false);

    function updateTree(
        notes: ItemNoteTree[],
        noteId: string,
        updater: (note: ItemNoteTree) => ItemNoteTree,
    ): ItemNoteTree[] {
        return notes.map((note) => {
            if (note._id.toString() === noteId) {
                return updater(note);
            }

            return {
                ...note,
                replies: updateTree(note.replies, noteId, updater),
            };
        });
    }

    function addReplyToTree(
        notes: ItemNoteTree[],
        parentId: string,
        reply: ItemNoteTree,
    ): ItemNoteTree[] {
        return notes.map((note) => {
            if (note._id.toString() === parentId) {
                return {
                    ...note,
                    replies: [...note.replies, reply],
                };
            }

            return {
                ...note,
                replies: addReplyToTree(note.replies, parentId, reply),
            };
        });
    }

    const onLike = async (noteId: string) => {
        if (!user?._id) {
            toast.error("You must be signed in to like an item note.");
            return;
        }

        try {
            const response = await fetch(`/api/item-notes/${noteId}/like`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to toggle like");
            }

            const data: {
                likes: ItemNote["likes"];
            } = await response.json();

            setItemNotes((prev) =>
                updateTree(prev, noteId, (note) => ({
                    ...note,
                    likes: data.likes,
                })),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const onEdit = async (noteId: string, content: string) => {
        try {
            const response = await fetch(`/api/item-notes/${noteId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    note: content,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to edit note");
            }

            setItemNotes((prev) =>
                updateTree(prev, noteId, (note) => ({
                    ...note,
                    note: content,
                })),
            );

            setEditing("");
            toast.success("Item note edited successfully!");
        } catch (error) {
            console.error(error);
        }
    };

    function onDelete(noteId: string) {
        openModal(
            <ConfirmationModal
                title="Delete Note"
                icon={LuTriangleAlert}
                body="Are you sure you want to delete this item note?"
                onConfirm={() => _onDelete(noteId)}
                loading={loading}
            />,
        );
    }

    const _onDelete = async (noteId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/item-notes/${noteId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete note");
            }

            setItemNotes((prev) =>
                updateTree(prev, noteId, (note) => ({
                    ...note,
                    note: "",
                    deletedAt: new Date(),
                })),
            );
            toast.success("Item note deleted successfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    const onReply = async (parentId: string, content: string) => {
        try {
            const body = {
                lostItemId: itemNotes[0].lostItemId,
                parentId,
                note: content,
                user: !anonymizeReply && user ? user : undefined,
            };

            const response = await fetch("/api/item-notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error("Failed to create reply");
            }

            const reply: ItemNoteTree = await response.json();

            setItemNotes((prev) =>
                addReplyToTree(prev, parentId, {
                    ...reply,
                    replies: [],
                }),
            );
            toast.success("Item note posted successfully!");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <LuSticker className="text-buzz-gold" />
                Community Item Notes
            </h3>

            {itemNotes.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {itemNotes.map((note) => (
                        <ItemNoteCard
                            key={note._id.toString()}
                            note={note}
                            editing={editing}
                            setEditing={setEditing}
                            replying={replying}
                            setReplying={setReplying}
                            anonymizeReply={anonymizeReply}
                            setAnonymizeReply={setAnonymizeReply}
                            onLike={onLike}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReply={onReply}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-foreground/2 border border-dashed border-gray-200 rounded-lg p-6 text-center text-foreground/70">
                    No item notes have been submitted yet. Be the first!
                </div>
            )}
        </div>
    );
}

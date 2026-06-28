import { useUser } from "@/context/UserContext";
import { ItemNoteTree } from "@/model/ItemNote";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ItemNoteCardProps {
    note: ItemNoteTree;
    editing: string;
    setEditing: Dispatch<SetStateAction<string>>;
    replying: string;
    setReplying: Dispatch<SetStateAction<string>>;
    anonymizeReply: boolean;
    setAnonymizeReply: Dispatch<SetStateAction<boolean>>;
    onLike: (noteId: string) => void;
    onEdit: (noteId: string, content: string) => void;
    onDelete: (noteId: string) => void;
    onReply: (parentId: string, content: string) => void;
}

export function ItemNoteCard({
    note,
    editing,
    setEditing,
    replying,
    setReplying,
    anonymizeReply,
    setAnonymizeReply,
    onLike,
    onEdit,
    onDelete,
    onReply,
}: ItemNoteCardProps) {
    const { user } = useUser();
    const currentUserId = user?._id;

    const isOwner =
        currentUserId && note.user?._id?.toString() === currentUserId;

    const hasLiked = note.likes.some(
        (like) => like.toString() === currentUserId,
    );

    const [editText, setEditText] = useState(note.note);
    const [replyText, setReplyText] = useState("");

    if (note.deletedAt && note.replies.length === 0) {
        return;
    }

    return (
        <div className="space-y-3">
            <div
                key={note._id.toString()}
                className="bg-white border border-gray-100 rounded-lg p-4 flex items-start gap-4"
            >
                {!note.deletedAt ? (
                    <>
                        {note.user ? (
                            <Link href={`/user/${note.user.username}`}>
                                <Image
                                    src={
                                        note.user?.image ?? "/images/default-icon.svg"
                                    }
                                    alt={note.user.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                />
                            </Link>
                        ) : (
                            <Image
                                src={"/images/default-icon.svg"}
                                alt={"Anonymous User"}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                        )}
                        <div className="flex-1 truncate">
                            <div className="flex flex-col gap-1 sm:items-center sm:justify-between mb-2 sm:flex-row sm:gap-2">
                                {note.user ? (
                                    <Link
                                        href={`/user/${note.user.username}`}
                                        className="space-x-2 whitespace-nowrap"
                                    >
                                        <span className="font-medium">
                                            {note.user?.name ?? "Anonymous"}
                                        </span>
                                        {note.user && (
                                            <span className="text-foreground/60 text-sm">
                                                @{note.user.username}
                                            </span>
                                        )}
                                    </Link>
                                ) : (
                                    <div className="font-medium">Anonymous</div>
                                )}

                                <span className="text-xs text-gray-500">
                                    {new Date(note.createdAt).toLocaleString(
                                        undefined,
                                        {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        },
                                    )}{" "}
                                    {note.createdAt !== note.updatedAt && (
                                        <i className="pr-px">(Edited)</i>
                                    )}
                                </span>
                            </div>

                            {editing === note._id.toString() ? (
                                <div className="space-y-1">
                                    <textarea
                                        value={editText}
                                        onChange={(e) =>
                                            setEditText(e.target.value)
                                        }
                                        className="w-full border border-foreground/30 rounded p-2 focus:outline-buzz-gold"
                                    />

                                    <div className="flex gap-2 text-sm">
                                        <button
                                            onClick={() => {
                                                onEdit?.(
                                                    note._id.toString(),
                                                    editText.trim(),
                                                );

                                                setEditing(note._id.toString());
                                            }}
                                            className="bg-buzz-gold text-background px-2 py-1 rounded hover:opacity-90 disabled:opacity-50"
                                            disabled={!editText.trim()}
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() => setEditing("")}
                                            className="border border-foreground/10 px-2 py-1 rounded hover:bg-foreground/5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {note.note}
                                </p>
                            )}
                            <div className="mt-3 flex items-center gap-2 text-sm text-foreground/60">
                                <button
                                    onClick={() => onLike(note._id.toString())}
                                    className={`flex items-center gap-2 mr-3 ${hasLiked ? "text-buzz-gold" : "text-foreground/70"}`}
                                >
                                    {hasLiked ? <FaHeart /> : <FaRegHeart />}{" "}
                                    {note.likes.length}
                                </button>

                                {!note.parentId && (
                                    <button
                                        onClick={() => {
                                            setReplying(note._id.toString());
                                            setEditing("");
                                        }}
                                    >
                                        Reply
                                    </button>
                                )}

                                {isOwner && (
                                    <>
                                        {!note.parentId && (
                                            <span className="opacity-80">
                                                •
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditing(note._id.toString());
                                                setReplying("");
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <span className="opacity-80">•</span>
                                        <button
                                            onClick={() =>
                                                onDelete?.(note._id.toString())
                                            }
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                            {replying === note._id.toString() && (
                                <div className="mt-3 space-y-1">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) =>
                                            setReplyText(e.target.value)
                                        }
                                        placeholder="Write a reply..."
                                        className="w-full border border-foreground/30 rounded p-2 focus:outline-buzz-blue"
                                    />
                                    {user?._id && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                id="anonymizeReply"
                                                checked={anonymizeReply}
                                                onChange={(e) =>
                                                    setAnonymizeReply(
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="anonymizeReply"
                                                className="text-sm"
                                            >
                                                Reply anonymously
                                            </label>
                                        </div>
                                    )}

                                    <div className="flex gap-2 text-sm">
                                        <button
                                            onClick={() => {
                                                if (!replyText.trim()) {
                                                    return;
                                                }

                                                onReply?.(
                                                    note._id.toString(),
                                                    replyText.trim(),
                                                );

                                                setReplyText("");
                                                setReplying("");
                                            }}
                                            className="bg-buzz-blue text-background px-2 py-1 rounded hover:opacity-90 disabled:opacity-50"
                                            disabled={!replyText.trim()}
                                        >
                                            Reply
                                        </button>

                                        <button
                                            onClick={() => setReplying("")}
                                            className="border border-foreground/10 px-2 py-1 rounded hover:bg-foreground/5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-700 italic">
                        This note has been deleted.
                    </p>
                )}
            </div>

            {note.replies.length > 0 && (
                <div className="ml-5 border-l-2 border-l-foreground/20 pl-4 space-y-3">
                    {note.replies.map((reply) => (
                        <ItemNoteCard
                            key={reply._id.toString()}
                            note={reply}
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
            )}
        </div>
    );
}

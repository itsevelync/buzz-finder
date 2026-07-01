"use server";

import { dbConnect } from "@/lib/mongo";
import ItemNoteModel, { ItemNote, ItemNoteTree } from "@/model/ItemNote";
import { sanitizeUser } from "@/lib/userUtils";

export async function getItemNotes(itemId: string) {
    try {
        await dbConnect();

        let notes = await ItemNoteModel.find(itemId ? { itemId } : {})
            .populate("user")
            .sort({ createdAt: 1 })
            .lean<ItemNote[]>();

        notes = notes.map((note) => {
            note.user = sanitizeUser(note.user);
            return note;
        });

        const noteMap = new Map();

        notes.forEach((note) => {
            noteMap.set(note._id.toString(), {
                ...note,
                replies: [],
            });
        });

        const rootNotes: ItemNoteTree[] = [];

        noteMap.forEach((note) => {
            if (note.parentId) {
                const parent = noteMap.get(note.parentId.toString());

                if (parent) {
                    parent.replies.push(note);
                } else {
                    rootNotes.push(note);
                }
            } else {
                rootNotes.push(note);
            }
        });

        return JSON.parse(JSON.stringify(rootNotes));
    } catch (e: unknown) {
        console.error("Error fetching item notes:", e);
        return [];
    }
}

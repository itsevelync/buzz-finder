import { dbConnect } from "@/lib/mongo";
import ItemNoteModel, { ItemNote } from "@/model/ItemNote";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;

        let notes = await ItemNoteModel.find({
            itemId: id,
        })
            .populate("user")
            .sort({ createdAt: 1 })
            .lean<ItemNote[]>();

        notes = notes.map((note) => {
            if (note.user) {
                if (note.user.hideEmail) {
                    delete note.user.email;
                }

                delete note.user.hideEmail;
            }

            return note;
        });

        const noteMap = new Map();

        notes.forEach((note) => {
            noteMap.set(note._id.toString(), {
                ...note,
                replies: [],
            });
        });

        const rootNotes: typeof notes = [];

        noteMap.forEach((note) => {
            if (note.parentId) {
                const parent = noteMap.get(note.parentId.toString());

                if (parent) {
                    parent.replies.push(note);
                } else {
                    // Parent was deleted or missing
                    rootNotes.push(note);
                }
            } else {
                rootNotes.push(note);
            }
        });

        return Response.json(rootNotes);
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("GET /api/item-notes error:", e);

            return Response.json({ error: e.message }, { status: 500 });
        }

        return Response.json(
            { error: "An unexpected error occurred at GET /api/item-notes." },
            { status: 500 },
        );
    }
}

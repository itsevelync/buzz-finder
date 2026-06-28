import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import ItemNoteSchema from "@/model/ItemNote";
import LostItemPostModel from "@/model/LostItemPost";
import { sendNotification } from "@/actions/Notification";
import ItemNoteModel, { ItemNote } from "@/model/ItemNote";
import { sanitizeUser } from "@/lib/userUtils";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const itemId = request.nextUrl.searchParams.get("itemId");

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

/**
 * Creates a new item note in the database matching the body of the request.
 * Also sends a notification to the owner of the lost item post.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();

        // 1. Create and populate the new item note
        let newItemNote = await ItemNoteSchema.create(body);
        await newItemNote.populate("user");

        // 2. Fetch the original lost item post to find out who the owner is
        const lostItem = await LostItemPostModel.findById(newItemNote.itemId);

        if (lostItem && lostItem.user) {
            const itemOwnerId = lostItem.user.toString();
            const actorId = newItemNote.user?._id?.toString();

            // Only notify the owner if someone ELSE left the note
            if (itemOwnerId !== actorId) {
                await sendNotification({
                    recipient: lostItem.user,
                    actor: newItemNote.user?._id || null,
                    resource: newItemNote._id,
                    resourceType: "ItemNote",
                    notificationType: "NEW_COMMENT",
                    body: newItemNote.note,
                });
            }
        }

        // 3. Complete the cleanup work for client response
        newItemNote = newItemNote.toObject();

        newItemNote.user = sanitizeUser(newItemNote.user);

        return new Response(JSON.stringify(newItemNote), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/item-notes error:", e);
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        }
        return new Response(
            JSON.stringify({
                error: "An unexpected error occurred at POST /api/item-notes.",
            }),
            { status: 500 },
        );
    }
}

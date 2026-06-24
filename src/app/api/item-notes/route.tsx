import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import ItemNoteSchema from "@/model/ItemNote";
import LostItemPostModel from "@/model/LostItemPost";
import { sendNotification } from "@/actions/Notification";

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

        if (newItemNote.user?.hideEmail) {
            delete newItemNote.user.email;
        }

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

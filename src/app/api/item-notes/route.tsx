import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import ItemNoteSchema from "@/model/ItemNote";

/**
 * Creates a new item note in the database matching the body of the request.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();

        const newItemNote = await ItemNoteSchema.create(body);
        await newItemNote.populate("user");
        return new Response(JSON.stringify(newItemNote), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/item-notes error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/item-notes." }), { status: 500 })
    }
}
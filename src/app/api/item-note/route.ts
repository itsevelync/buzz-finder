import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import ItemNoteSchema from "@/model/ItemNote";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Extract the query parameters from the request URL
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");

        // Guard clause in case itemId wasn't passed
        if (!itemId) {
            return new Response(JSON.stringify({ error: "Missing itemId parameter" }), { status: 400 });
        }

        const notes = await ItemNoteSchema.find({ lostItemId: itemId })
            .populate("user")
            .exec();

        return new Response(JSON.stringify(notes), { status: 200 });

    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("GET /api/item-note error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(
            JSON.stringify({ error: "An unexpected error occurred at GET /api/item-note." }),
            { status: 500 }
        );
    }
}

/**
 * Creates a new item note in the database matching the body of the request.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();

        const newItemNote = await ItemNoteSchema.create(body);
        return new Response(JSON.stringify(newItemNote), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/item-note error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/item-note." }), { status: 500 })
    }
}
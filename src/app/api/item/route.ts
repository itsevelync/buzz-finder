import { NextRequest } from "next/server";

import ItemSchema from "@/model/Item";

import { dbConnect } from "@/lib/mongo";
import mongoose, { Types } from "mongoose";

/**
 * If an "id" query parameter is provided, returns the item with that ID.
 * Otherwise returns all items in the database.
 * 
 */
export async function GET(req: NextRequest) {
    console.log("GET request received at /api/item");
    // Searching for specific item by id
    const id = req.nextUrl.searchParams.get("_id");
    const personFound = req.nextUrl.searchParams.get("person_found");

    if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return new Response(JSON.stringify({ error: "Invalid ID." }), { status: 400 });
        const item = await ItemSchema.findById(id);
        return new Response(JSON.stringify(item), { status: 200 });
    } else {
        const query: { person_found?: string; deletedAt: null } = {
            deletedAt: null,
        };
        if (personFound) {
            query.person_found = personFound;
        }
        const items = await ItemSchema.find(query).sort({ lostdate: -1 });
        return new Response(JSON.stringify(items), { status: 200 });
    }
}
/**
 * Creates a new item in the database matching the body of the request.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();

        if (body.person_found && Types.ObjectId.isValid(body.person_found)) {
            body.person_found = new Types.ObjectId(body.person_found as string);
        }

        const newItem = await ItemSchema.create(body);
        return new Response(JSON.stringify(newItem), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/item error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/item." }), { status: 500 })

    }
}
/**
 * Pass in a body matching the Item schema, including the id of the item to update.
 * THe Items fields will be updated to match the body and the updated item will be returned.
 */
export async function PUT(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID." }), { status: 400 });
    }
    try {
        await dbConnect();
        const updatedItem = await ItemSchema.findByIdAndUpdate(id, body, { new: true });
        if (!updatedItem) {
            return new Response(JSON.stringify({ error: "Item not found." }), { status: 404 });
        }
        return new Response(JSON.stringify(updatedItem), { status: 200 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at PUT /api/item." }), { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID." }), { status: 400 });
    }
    try {
        await dbConnect();
        const deletedItem = await ItemSchema.findByIdAndDelete(id);
        if (!deletedItem) {
            return new Response(JSON.stringify({ error: "Item not found." }), { status: 404 });
        }
        return new Response(JSON.stringify(deletedItem), { status: 200 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at DELETE /api/item." }), { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID." }), { status: 400 });
    }
    try {
        await dbConnect();
        const updatedItem = await ItemSchema.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return new Response(JSON.stringify({ error: "Item not found." }), { status: 404 });
        }
        return new Response(JSON.stringify(updatedItem), { status: 200 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at PATCH /api/item." }), { status: 500 })
    }
}
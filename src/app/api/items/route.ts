import { NextRequest } from "next/server";

import ItemSchema from "@/model/Item";

import { dbConnect } from "@/lib/mongo";
import mongoose, { Types } from "mongoose";
import { sanitizeUser } from "@/lib/userUtils";

/**
 * If a "personFound" query parameter is provided, return items found by that user.
 * Otherwise, return all items that aren't deleted.
 */
export async function GET(req: NextRequest) {
    await dbConnect();

    const personFound = req.nextUrl.searchParams.get("personFound");

    const query: { personFound?: string; deletedAt: null } = {
        deletedAt: null,
    };

    if (personFound) {
        query.personFound = personFound;
    }

    const items = await ItemSchema.find(query)
        .populate("personFound", "-password")
        .sort({ lostDate: -1 })
        .lean();

    const sanitizedItems = items.map((item) => {
        item.personFound = sanitizeUser(item.personFound);

        return item;
    });

    return new Response(JSON.stringify(sanitizedItems), {
        status: 200,
    });
}

/**
 * Creates a new item in the database matching the body of the request.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();

        if (body.personFound && Types.ObjectId.isValid(body.personFound)) {
            body.personFound = new Types.ObjectId(body.personFound as string);
        }

        const newItem = await ItemSchema.create(body);
        return new Response(JSON.stringify(newItem), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/items error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/items." }), { status: 500 })

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
        return new Response(JSON.stringify({ error: "An unexpected error occurred at PUT /api/items." }), { status: 500 })
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
        return new Response(JSON.stringify({ error: "An unexpected error occurred at DELETE /api/items." }), { status: 500 })
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
        return new Response(JSON.stringify({ error: "An unexpected error occurred at PATCH /api/items." }), { status: 500 })
    }
}
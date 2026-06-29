import { NextRequest } from "next/server";

import ItemSchema from "@/model/Item";

import { dbConnect } from "@/lib/mongo";
import { Types } from "mongoose";
import { sanitizeUser } from "@/lib/userUtils";
import { processSavedSearches } from "@/actions/SavedSearch";

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

        // Notifies users with saved searches that match the item
        processSavedSearches(newItem).catch((err) =>
            console.error("Error processing saved searches:", err),
        );

        return new Response(JSON.stringify(newItem), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("POST /api/items error:", e);
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        }
        return new Response(
            JSON.stringify({
                error: "An unexpected error occurred at POST /api/items.",
            }),
            { status: 500 },
        );
    }
}

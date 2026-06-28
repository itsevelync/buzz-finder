import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/mongo";
import ItemMatch, { IItemMatch } from "@/model/ItemMatch";
import { LostItemPost2 } from "@/model/LostItemPost";
import { Item } from "@/model/Item";
import { Schema } from "mongoose";
import { sendNotification } from "@/actions/Notification";

// GET: Fetch matches by lostItemId or foundItemId
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = req.nextUrl;
        const lostItemId = searchParams.get("lostItemId");
        const foundItemId = searchParams.get("foundItemId");

        const query: { lostItemId?: string, foundItemId?: string } = {};
        if (lostItemId) query.lostItemId = lostItemId;
        if (foundItemId) query.foundItemId = foundItemId;

        const match = await ItemMatch.findOne(query)
            .populate("lostItemId")
            .populate("foundItemId")
            .lean<IItemMatch>();

        if (!match) return new Response(JSON.stringify({}), { status: 200 });

        const transformedMatch = {
            lostItem: match.lostItemId,
            foundItem: match.foundItemId,
        };

        return new Response(JSON.stringify(transformedMatch), { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "Failed to fetch item matches. Unknown server error." }), { status: 500 });
        }
    }
}

interface ItemMatchPostReturn {
    _id: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    lostItemId: LostItemPost2;
    foundItemId: Item;
}

// POST: Create or Update an existing match
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, lostItemId, foundItemId } = body;

        if (!lostItemId || !foundItemId) {
            return new Response(
                JSON.stringify({ error: "Both lostItemId and foundItemId are required" }),
                { status: 400 }
            );
        }

        // Search for an existing match where EITHER the lostItemId OR the foundItemId is already mapped
        // This ensures IDs remain unique to a single match relationship if that's your business logic.
        const filter = {
            $or: [
                { lostItemId },
                { foundItemId }
            ]
        };

        const update = {
            userId,      // Update with the incoming userId
            lostItemId,  // Keeps it consistent or updates if only one matched
            foundItemId
        };

        // upsert: true -> creates it if it doesn't exist, updates if it does
        // new: true -> returns the newly updated/created document
        const match = await ItemMatch.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true,
            runValidators: true
        }).populate("lostItemId")
            .populate("foundItemId")
            .lean<ItemMatchPostReturn>();

        if (!match) return new Response(JSON.stringify({ error: "Unknown error posting item match." }), { status: 500 });

        const transformedMatch = {
            lostItem: match.lostItemId,
            foundItem: match.foundItemId,
        };

        // Only notify the lost item owner if someone ELSE matched the item
        if (transformedMatch.lostItem.user && transformedMatch.lostItem.user !== userId) {
            await sendNotification({
                recipient: transformedMatch.lostItem.user,
                actor: userId,
                resource: transformedMatch.foundItem._id.toString(),
                resourceType: "Item",
                notificationType: "ITEM_MATCH",
                body: transformedMatch.lostItem.name,
            });
        }

        return new Response(JSON.stringify(transformedMatch), { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "Failed to post item match. Unknown server error." }), { status: 500 });
        }
    }
}

// DELETE: Delete a match by lostItemId or foundItemId
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = req.nextUrl;
        const lostItemId = searchParams.get("lostItemId");
        const foundItemId = searchParams.get("foundItemId");

        const query: { lostItemId?: string, foundItemId?: string } = {};
        if (lostItemId) query.lostItemId = lostItemId;
        if (foundItemId) query.foundItemId = foundItemId;

        if (!lostItemId && !foundItemId) {
            return new Response(
                JSON.stringify({ error: "Must provide either lostItemId or foundItemId to delete" }),
                { status: 400 }
            );
        }

        const deletedMatch = await ItemMatch.findOneAndDelete(query);

        if (!deletedMatch) {
            return new Response(JSON.stringify({ message: "No matching record found to delete" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Match deleted successfully", deletedMatch }), { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "Failed to delete item match. Unknown server error." }), { status: 500 });
        }
    }
}
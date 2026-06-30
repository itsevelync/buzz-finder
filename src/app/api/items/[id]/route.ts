import { dbConnect } from "@/lib/mongo";
import Item from "@/model/Item";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ItemSchema from "@/model/Item";
import { auth } from "@/auth";
import { sendNotification } from "@/actions/Notification";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Item.findById(id);

        if (!item) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404 },
            );
        }
        return NextResponse.json({ item }, { status: 200 });
    } catch (error) {
        console.error("Error fetching item:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(
            JSON.stringify({ error: "Invalid or missing ID in URL path." }),
            { status: 400 },
        );
    }

    try {
        const updateData = await req.json();

        await dbConnect();

        const item = await ItemSchema.findById(id);

        if (!item) {
            return new Response(JSON.stringify({ error: "Item not found." }), {
                status: 404,
            });
        }

        Object.assign(item, updateData);
        const hasChanges = item.isModified();
        const updatedItem = await item.save();

        if (hasChanges) {
            const session = await auth();

            if (updatedItem.personFound.toString() !== session?.user?._id) {
                await sendNotification({
                    recipient: updatedItem.personFound,
                    actor: session?.user?._id || undefined,
                    resource: id,
                    resourceType: "Item",
                    notificationType: "ITEM_UPDATE",
                    body: updatedItem.status,
                });
            }
        }

        return new Response(JSON.stringify(updatedItem), { status: 200 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        } else {
            return new Response(
                JSON.stringify({
                    error: "An unexpected error occurred updating the item.",
                }),
                { status: 500 },
            );
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;

        const item = await Item.findByIdAndUpdate(
            id,
            { deletedAt: new Date() },
            { new: true },
        );

        if (!item) {
            return NextResponse.json(
                { message: "Lost item not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { message: "Item marked as deleted", item },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error deleting item:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

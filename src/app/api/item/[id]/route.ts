import { dbConnect } from "@/lib/mongo";
import Item from "@/model/Item";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ItemSchema from "@/model/Item";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Item.findById(id);

        if (!item) {
            return NextResponse.json({ message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ item }, { status: 200 });
    } catch (error) {
        console.error("Error fetching item:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
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
        } else {
            return new Response(JSON.stringify({ error: "An unexpected error occurred updating the item." }), { status: 500 });
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const item = await Item.findByIdAndUpdate(id, { deletedAt: new Date() },
            { new: true });

        if (!item) {
            return NextResponse.json(
                { message: "Lost item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Item marked as deleted", item },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting item:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
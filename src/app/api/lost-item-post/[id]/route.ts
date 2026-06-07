import { dbConnect } from "@/lib/mongo";
import LostItem from "@/model/LostItemPost";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await LostItem.findById(id).populate(
        "user",
        "username image"
    );

    if (!item) {
      return NextResponse.json(
        { message: "Lost item not found" },
        { status: 404 }
      );
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

export async function PATCH(req: NextRequest, context: RouteContext) {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID in URL path." }), { status: 400 });
    }

    try {
        const updateData = await req.json();

        await dbConnect();
        const updatedPost = await LostItem.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return new Response(JSON.stringify({ error: "Lost item post not found." }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedPost), { status: 200 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "An unexpected error occurred updating this post." }), { status: 500 });
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const item = await LostItem.findByIdAndUpdate(id, { deletedAt: new Date() },
            { new: true });

        if (!item) {
            return NextResponse.json(
                { message: "Lost item post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Lost item post marked as deleted", item },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting lost item post:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

import { dbConnect } from "@/lib/mongo";
import LostItem from "@/model/LostItemPost";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const item = await LostItem.findById(id).populate("user", "username image");

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const item = await LostItem.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

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

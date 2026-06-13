import { auth } from "@/auth";
import ItemNote from "@/model/ItemNote";
import { ObjectId } from "mongoose";
import { NextRequest } from "next/server";

export async function POST(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    const session = await auth();

    if (!session?.user?._id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await ItemNote.findById(id);

    if (!note) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    const userId = session.user._id;

    const alreadyLiked = note.likes.some(
        (like: ObjectId) => like.toString() === userId,
    );

    if (alreadyLiked) {
        note.likes.pull(userId);
    } else {
        note.likes.addToSet(userId);
    }

    await note.save();

    return Response.json({
        likes: note.likes,
    });
}

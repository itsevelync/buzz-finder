import { NextRequest } from "next/server";
import LostItemPostSchema from "@/model/LostItemPost";
import { dbConnect } from "@/lib/mongo";

/**
 * Returns all lost item posts in the database.
 */
export async function GET(req: NextRequest) {
    console.log("GET request received at /api/lost-item-post");
    const user = req.nextUrl.searchParams.get("user");

    const query: { user?: string; deletedAt: null } = {
        deletedAt: null,
    };
    
    if (user) {
        query.user = user;
    }

    const lostItemPosts = await LostItemPostSchema.find(query).sort({ createdAt: -1 }).populate(
        "user",
        "username image"
    );
    return new Response(JSON.stringify(lostItemPosts), { status: 200 });
}
/**
 * Creates a new item in the database matching the body of the request.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        await dbConnect();
        const newLostItemPost = await LostItemPostSchema.create(body);

        return new Response(JSON.stringify(newLostItemPost), { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/lost-item-post." }), { status: 500 })
    }
}

/**
 * Updates an existing lost item post in the database.
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing post ID." }), { status: 400 });
        }

        await dbConnect();

        const updatedPost = await LostItemPostSchema.findByIdAndUpdate(
            id,
            updates,
            { new: true } // return the updated document
        );

        if (!updatedPost) {
            return new Response(JSON.stringify({ error: "Post not found." }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedPost), { status: 200 });
    } catch (e: unknown) {
        console.error("PATCH /api/lost-item-post error:", e);
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "An unexpected error occurred updating the lost item post." }), { status: 500 });
        }
    }
}
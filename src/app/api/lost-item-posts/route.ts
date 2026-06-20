import { NextRequest } from "next/server";
import LostItemPostSchema, { LostItemPost } from "@/model/LostItemPost";
import { dbConnect } from "@/lib/mongo";

/**
 * Returns all lost item posts in the database.
 */
export async function GET(req: NextRequest) {
    const user = req.nextUrl.searchParams.get("user");

    const query: { user?: string; deletedAt: null } = {
        deletedAt: null,
    };

    if (user) {
        query.user = user;
    }

    const lostItemPosts = await LostItemPostSchema.find(query).sort({ createdAt: -1 }).populate("user").lean<LostItemPost[]>();

    const sanitizedPosts = lostItemPosts.map(post => {
        if (post.user) {
            if (post.user.hideEmail) {
                delete post.user.email;
            }

            delete post.user.hideEmail;
        }

        return post;
    });

    return new Response(JSON.stringify(sanitizedPosts), { status: 200 });
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
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/lost-item-posts." }), { status: 500 })
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
            { new: true }
        );

        if (!updatedPost) {
            return new Response(JSON.stringify({ error: "Post not found." }), { status: 404 });
        }

        return new Response(JSON.stringify(updatedPost), { status: 200 });
    } catch (e: unknown) {
        console.error("PATCH /api/lost-item-posts error:", e);

        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: "An unexpected error occurred updating the lost item post." }), { status: 500 });
        }
    }
}
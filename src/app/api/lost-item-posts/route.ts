import { NextRequest } from "next/server";
import LostItemPostSchema, { LostItemPost } from "@/model/LostItemPost";
import { dbConnect } from "@/lib/mongo";
import { sanitizeUser } from "@/lib/userUtils";

/**
 * Returns all lost item posts in the database.
 */
export async function GET(req: NextRequest) {
    await dbConnect();

    const user = req.nextUrl.searchParams.get("user");

    const query: { user?: string; deletedAt: null } = {
        deletedAt: null,
    };

    if (user) {
        query.user = user;
    }

    const lostItemPosts = await LostItemPostSchema.find(query)
        .sort({ createdAt: -1 })
        .populate("user")
        .lean<LostItemPost[]>();

    const sanitizedPosts = lostItemPosts.map((post) => ({
        ...post,
        user: sanitizeUser(post.user),
    }));

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
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        }
        return new Response(
            JSON.stringify({
                error: "An unexpected error occurred at POST /api/lost-item-posts.",
            }),
            { status: 500 },
        );
    }
}

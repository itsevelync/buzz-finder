import { NextRequest } from "next/server";
import LostItemPostSchema from "@/model/LostItemPost";
import { dbConnect } from "@/lib/mongo";

/**
 * Returns all lost item posts in the database.
 */
export async function GET(req: NextRequest) {
    console.log("GET request received at /api/lost-item-post");
    const user = req.nextUrl.searchParams.get("user");

    const query: { user?: string } = {};
    if (user) {
        query.user = user;
    }

    const lostItemPosts = await LostItemPostSchema.find(query).populate(
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
    } catch (e: any) {
        console.error("POST /api/lost-item-post error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
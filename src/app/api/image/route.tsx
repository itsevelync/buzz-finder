import { NextRequest } from "next/server";
import Image from "@/model/Image";



/**
 * Handles POST requests to save image data to the database. Not currently used in the app but DELETE request might be in the future.
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
    const data = await request.json();
    const body = data.body;
    Image.create(body);
    return new Response(JSON.stringify({ message: 'Image saved' }), { status: 200 });
}
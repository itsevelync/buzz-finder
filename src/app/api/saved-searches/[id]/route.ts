import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import SavedSearch from "@/model/SavedSearch";
import { auth } from "@/auth";
import mongoose from "mongoose";

/**
 * DELETE: Removes a specific saved search. Assures the requesting user owns it.
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        // 1. Authenticate the user
        const session = await auth();
        const userId = session?.user?._id;
        if (!userId) {
            return new NextResponse(
                JSON.stringify({
                    error: "Unauthorized. Please log in to delete saved searches.",
                }),
                { status: 401 },
            );
        }

        // 2. Parse and validate search target ID from URL parameter
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid or missing ID parameter." }),
                { status: 400 },
            );
        }

        // 3. Find and delete document, explicitly restricting access to matching userId
        const deletedSearch = await SavedSearch.findOneAndDelete({
            _id: id,
            userId: userId,
        });

        if (!deletedSearch) {
            return new NextResponse(
                JSON.stringify({
                    error: "Saved search not found or you do not have permission to delete it.",
                }),
                { status: 404 },
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "Saved search successfully removed.",
                deletedSearch,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (e: unknown) {
        console.error("DELETE /api/saved-searches error:", e);
        return new NextResponse(
            JSON.stringify({
                error: "An unexpected error occurred while deleting your saved search.",
            }),
            { status: 500 },
        );
    }
}

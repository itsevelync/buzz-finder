import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import SavedSearch from "@/model/SavedSearch";
import { auth } from "@/auth";

/**
 * GET: Retrieves all saved searches belonging to the authenticated user.
 */
export async function GET() {
    try {
        await dbConnect();

        // 1. Authenticate the user
        const session = await auth();
        const userId = session?.user?._id;
        if (!userId) {
            return new NextResponse(
                JSON.stringify({
                    error: "Unauthorized. Please log in to view saved searches.",
                }),
                { status: 401 },
            );
        }

        // 2. Fetch searches matching the logged-in user
        const searches = await SavedSearch.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return new NextResponse(JSON.stringify(searches), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: unknown) {
        console.error("GET /api/saved-searches error:", e);
        return new NextResponse(
            JSON.stringify({
                error: "An unexpected error occurred while fetching your saved searches.",
            }),
            { status: 500 },
        );
    }
}

/**
 * POST: Creates a new saved search criteria bundle for an authenticated user.
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const session = await auth();
        const userId = session?.user?._id;
        if (!userId) {
            return new NextResponse(
                JSON.stringify({
                    error: "Unauthorized. Please log in to save searches.",
                }),
                { status: 401 },
            );
        }

        const body = await req.json();
        const { query, categories, maxDistance, locationPin } = body;

        const hasQuery = typeof query === "string" && query.trim().length > 0;
        const hasCategories =
            Array.isArray(categories) && categories.length > 0;
        const hasDistance =
            typeof maxDistance === "number" &&
            locationPin?.lat &&
            locationPin?.lng;

        if (!hasQuery && !hasCategories && !hasDistance) {
            return new NextResponse(
                JSON.stringify({
                    error: "Cannot save an empty search. Provide a keyword, category, or distance filter.",
                }),
                { status: 400 },
            );
        }

        const cleanQuery = hasQuery ? query.trim() : "";
        const cleanCategories = hasCategories ? categories : [];
        const cleanMaxDistance =
            typeof maxDistance === "number" ? maxDistance : null;
        const cleanLocationPin = hasDistance
            ? { lat: locationPin.lat, lng: locationPin.lng }
            : null;

        const existingSearchQuery: Record<string, unknown> = {
            userId,
            query: cleanQuery,
            maxDistance: cleanMaxDistance,
        };

        if (cleanCategories.length > 0) {
            existingSearchQuery.categories = {
                $all: cleanCategories,
                $size: cleanCategories.length,
            };
        } else {
            existingSearchQuery.categories = { $size: 0 };
        }

        if (cleanLocationPin) {
            existingSearchQuery["locationPin.lat"] = cleanLocationPin.lat;
            existingSearchQuery["locationPin.lng"] = cleanLocationPin.lng;
        } else {
            existingSearchQuery.locationPin = null;
        }

        const existingSearch = await SavedSearch.findOne(existingSearchQuery);

        if (existingSearch) {
            return new NextResponse(
                JSON.stringify({
                    error: "You have already saved this search.",
                }),
                { status: 409 },
            );
        }

        const savedSearchData = {
            userId,
            query: cleanQuery,
            categories: cleanCategories,
            maxDistance: cleanMaxDistance,
            locationPin: cleanLocationPin,
        };

        const newSavedSearch = await SavedSearch.create(savedSearchData);

        return new NextResponse(JSON.stringify(newSavedSearch), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: unknown) {
        console.error("POST /api/saved-searches error:", e);
        if (e instanceof Error) {
            return new NextResponse(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        }
        return new NextResponse(
            JSON.stringify({
                error: "An unexpected error occurred while saving your search.",
            }),
            { status: 500 },
        );
    }
}

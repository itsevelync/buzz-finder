import { PlainItem2 } from "@/model/Item";

import { dbConnect } from "@/lib/mongo";
import { FilterQuery } from "mongoose";

import { sendNotification } from "@/actions/Notification";
import SavedSearch, { ISavedSearch } from "@/model/SavedSearch";
import { calculateDistance } from "@/lib/itemUtils";
import { auth } from "@/auth";

export async function processSavedSearches(item: PlainItem2) {
    await dbConnect();

    const session = await auth();

    // 1. Fetch all saved searches.
    const queryConditions: FilterQuery<ISavedSearch> = {};
    if (item.category) {
        queryConditions.$or = [
            { categories: { $size: 0 } }, // Matches "All Categories" saved searches
            { categories: item.category }, // Matches searches explicitly tracking this category
        ];
    }

    const savedSearches = await SavedSearch.find(queryConditions);

    for (const search of savedSearches) {
        // Avoid sending notifications to the user who posted the item
        if (session?.user?._id === search.userId.toString()) {
            continue;
        }

        // 2. Evaluate Text Search Term Matching
        // (Checking 'name,' 'description' and 'locationDescription' fields)
        if (search.query) {
            const cleanQuery = search.query.toLowerCase();
            const nameMatch = item.name?.toLowerCase().includes(cleanQuery);
            const descMatch = item.description
                ?.toLowerCase()
                .includes(cleanQuery);
            const locMatch = item.locationDescription
                ?.toLowerCase()
                .includes(cleanQuery);

            if (!nameMatch && !descMatch && !locMatch) continue; // No keyword match, skip
        }

        // 3. Evaluate Distance/Radius Matching
        if (search.maxDistance && search.locationPin && item.locationPin) {
            const distance = calculateDistance(
                search.locationPin.lat,
                search.locationPin.lng,
                item.locationPin.lat,
                item.locationPin.lng,
            );
            if (distance > search.maxDistance) continue; // Outside boundary, skip
        }

        // 4. Fire Notification via Pusher
        await sendNotification({
            recipient: search.userId,
            actor: item.personFound, // Author of post
            resource: item._id,
            resourceType: "Item",
            notificationType: "SEARCH_ALERT", //
            body: search.query,
        });
    }
}

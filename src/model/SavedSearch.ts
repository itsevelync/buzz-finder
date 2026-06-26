import mongoose, { Schema, Document, InferSchemaType } from "mongoose";

export interface ISavedSearch extends Document {
    userId: mongoose.Types.ObjectId;
    query?: string;
    categories?: string[];
    maxDistance?: number;
    locationPin?: {
        lat: number;
        lng: number;
    };
    resourceType: "Item" | "LostItemPost";
    createdAt: Date;
}

export interface SavedSearchItem {
    _id: string;
    query?: string;
    categories?: string[];
    maxDistance?: number | null;
    locationPin?: { lat: number; lng: number } | null;
    createdAt: string;
}

const SavedSearchSchema = new Schema<ISavedSearch>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    query: { type: String, default: "" },
    categories: [{ type: String }],
    maxDistance: { type: Number, default: null }, // In kilometers
    locationPin: {
        lat: { type: Number },
        lng: { type: Number },
    },
    resourceType: {
        type: String,
        enum: ["Item", "LostItemPost"],
        default: "Item",
    },
    createdAt: { type: Date, default: Date.now },
});

export type SavedSearch = InferSchemaType<typeof SavedSearchSchema>;
export default mongoose.models.SavedSearch ||
    mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);

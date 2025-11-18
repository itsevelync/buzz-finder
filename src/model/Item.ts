import mongoose, { InferSchemaType, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { CATEGORY_KEYS } from "@/constants/Categories";

const ItemSchema = new Schema(
    {
        title: {
            required: true,
            type: String,
            trim: true,
        },
        isLost: {
            required: true,
            type: Boolean,
            default: false // true if lost, false if found
        },
        image: {
            id: { type: String },
            url: { type: String },
        },
        item_description: {
            type: String
        },
        retrieval_description: {
            type: String
        },
        category: {
            type: String,
            required: true,
            enum: CATEGORY_KEYS,
            default: "misc"
        },
        position: {
            _id: false,
            type: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
            required: true,
        },
        location_details: {
            type: String,
            trim: true,
        },
        person_found: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        person_lost: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        lostdate: {
            type: Date,
            default: Date.now
        },
        contact_info: {
            type: String,
            trim: true
        },
        comments: {
            type: String
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

type Item = InferSchemaType<typeof ItemSchema> & {
    _id: ObjectId;
};

export type PlainItem = Omit<Item, "_id" | "person_found"> & {
    _id: string;
    person_found?: string;
};

export type { Item };

export default mongoose.models?.Item ??
    mongoose.model<Item>("Item", ItemSchema);
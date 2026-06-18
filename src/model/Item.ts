import mongoose, { InferSchemaType, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { CATEGORY_KEYS } from "@/constants/Categories";

const ItemSchema = new Schema(
    {
        name: {
            required: true,
            type: String,
            trim: true,
        },
        image: {
            id: { type: String },
            url: { type: String },
        },
        description: {
            type: String
        },
        retrievalDescription: {
            type: String
        },
        category: {
            type: String,
            required: true,
            enum: CATEGORY_KEYS,
            default: "misc"
        },
        locationPin: {
            _id: false,
            type: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
            required: true,
        },
        locationDescription: {
            type: String,
            trim: true,
        },
        personFound: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        lostDate: {
            type: Date,
            default: Date.now
        },
        contactInfo: {
            _id: false,
            type: {
                name: { type: String },
                details: { type: String },
            },
        },
        deletedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            required: true,
            enum: ['unclaimed', 'claimed', 'gone', 'archived'],
            default: 'unclaimed',
            trim: true
        },
    },
    { timestamps: true }
);

type Item = InferSchemaType<typeof ItemSchema> & {
    _id: ObjectId;
};

export type PlainItem = Omit<Item, "_id" | "personFound"> & {
    _id: string;
    personFound?: string;
};

export type { Item };

export default mongoose.models?.Item ??
    mongoose.model<Item>("Item", ItemSchema);
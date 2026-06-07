import mongoose, { Schema, InferSchemaType } from "mongoose";
import { ObjectId } from "mongodb";
import { User } from "next-auth";
import { CATEGORY_KEYS } from "@/constants/Categories";

const LostItemPostSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            id: { type: String },
            url: { type: String },
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: CATEGORY_KEYS,
            default: "misc",
        },
        locationDescription: {
            type: String,
        },
        locationPin: {
            _id: false,
            type: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        lostDate: {
            type: Date,
            default: null
        },
        user: {
            type: ObjectId,
            ref: "User",
        },
        contactInfo: {
            _id: false,
            type: {
                name: { type: String },
                details: { type: String },
            },
        },
        isFound: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

type LostItemPost = InferSchemaType<typeof LostItemPostSchema> & {
    _id: ObjectId;
    user?: User;
};

export type { LostItemPost };

export default mongoose.models?.LostItemPost ??
    mongoose.model("LostItemPost", LostItemPostSchema);

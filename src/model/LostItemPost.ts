import mongoose, { Schema, InferSchemaType } from "mongoose";
import { ObjectId } from "mongodb";
import { User } from "next-auth";
import { CATEGORY_KEYS } from "@/constants/Categories";

const LostItemPostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        lastSeen: {
            type: String,
        },
        user: {
            type: ObjectId,
            ref: "User",
        },
        isFound: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            enum: CATEGORY_KEYS,
            default: "misc",
        },
        contactInfo: {
            type: String,
        },
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

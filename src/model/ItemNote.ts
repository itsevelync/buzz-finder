import mongoose, { InferSchemaType, ObjectId, Schema } from "mongoose";
import { User as AuthUser } from "next-auth";
import { User } from "./User";

const ItemNoteSchema = new Schema(
    {
        note: {
            required: true,
            type: String,
            trim: true,
        },
        lostItemId: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "LostItemPost",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "ItemNote",
            default: null,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

type BaseItemNote = InferSchemaType<typeof ItemNoteSchema>;

export type ItemNote = Omit<BaseItemNote, "user" | "parentId" | "likes"> & {
    _id: ObjectId;
    user?: AuthUser | User;
    parentId?: ObjectId | ItemNote | null | string;
    likes: (ObjectId | AuthUser | User)[];
};

export default mongoose.models?.ItemNote ??
    mongoose.model("ItemNote", ItemNoteSchema);

export type ItemNoteTree = ItemNote & {
    replies: ItemNoteTree[];
};
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
    },
    { timestamps: true }
);

type BaseItemNote = InferSchemaType<typeof ItemNoteSchema>;

export type ItemNote = Omit<BaseItemNote, "user"> & {
    _id: ObjectId;
    user?: AuthUser | User;
};

export default mongoose.models?.ItemNote ??
    mongoose.model("ItemNote", ItemNoteSchema);
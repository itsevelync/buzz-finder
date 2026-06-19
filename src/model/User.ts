import mongoose, { InferSchemaType, Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            required: true,
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        password: {
            type: String,
            trim: true,
        },
        email: {
            required: true,
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
        },
        hideEmail: {
            type: Boolean,
            default: false,
        },
        username: {
            required: true,
            type: String,
            trim: true,
            unique: true,
        },
        phoneNum: {
            required: false,
            type: String,
            trim: true,
        },
        description: {
            required: false,
            type: String,
        },
        discord: {
            required: false,
            type: String,
            trim: true,
        },
        instagram: {
            required: false,
            type: String,
            trim: true,
        },
        linkedIn: {
            required: false,
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

type BaseUser = InferSchemaType<typeof UserSchema>;

export type User = Omit<BaseUser, "email" | "hideEmail"> & {
    _id: string;
    email?: string;
    hideEmail?: boolean;
};

export default mongoose.models?.User ??
    mongoose.model("User", UserSchema);

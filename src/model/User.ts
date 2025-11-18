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
        username: {
            required: true,
            type: String,
            trim: true,
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
        }
    },
    { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema> & {
    _id: string;
};

export default mongoose.models?.User ??
    mongoose.model("User", UserSchema);
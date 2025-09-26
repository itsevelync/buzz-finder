import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            required: true,
            type: String,
            trim: true,
        },
        password: {
            required: true,
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
            trim: true
        },
        phoneNum: {
            required: false,
            type: String,
            trim: true,
        },
        userId: {
            required: true,
            type: Number,
            trim: true,
        },
        description: {
            required: false,
            type: String,
        }
    },
    { timestamps: true }
);

export default mongoose.models?.User ??
    mongoose.model("User", UserSchema);
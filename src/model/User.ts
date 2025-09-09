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
        },
    },
    { timestamps: true }
);

export default mongoose.models?.User ??
    mongoose.model("User", UserSchema);
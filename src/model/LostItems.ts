import mongoose, { Schema } from "mongoose";

const LostItemsSchema = new Schema(
    {
        itemID: {
            required: true,
            type: String,
        },
        comments: {
            required: true,
            type: String,
        },

        color: {
            required: false,
            type: String,
        },

        brand: {
            required: false,
            type: String,
        },

        serialNumber: {
            required: false,
            type: String,
        },

        lastLocation: {
            required: true,
            type: String,
        },

        dateLost: {
            required: true,
            type: Date,
        },

        contactEmail: {
            required: true,
            type: String,
        },

        contactName: {
            required: true,
            type: String,
        }
    },
    { timestamps: true }
);

export default mongoose.models?.LostItems ??
    mongoose.model("LostItems", LostItemsSchema);
import mongoose, { Schema } from "mongoose";
import User from "./User";

const ItemSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            required: true,
            type: String,
            trime: true,
        },
        status: {
            required: true,
            type: Boolean
        },
        image: {
            type: String
        },
        item_description: {
            type: String
        },
        retrieval_description: {
            type: String
        },
        category: {
            type: String,
            required: true,
            enum: ["clothing", "electronics", "books", "buzzcard", "pets", "other"],
            default: "other"
        },
        position: {
            lat: {
                type: Number,
                required: true
            },
            lon: {
                type: Number,
                required: true
            }
        },
        location_details: {
            type: String,
            trim: true,
        },
        person_found: {
            type: User
        },
        person_lost: {
            type: User
        },
        lostdate: {
            type: Date,
            default: Date.now
        },
        contact_info: {
            type: String
        },
        comments: {
            type: String
        }
    }
);

export default mongoose.models?.Item ??
    mongoose.model("Item", ItemSchema);
import mongoose, { Schema } from "mongoose";
import User from "./User";
import { ObjectId } from "mongodb";

const ItemSchema = new Schema(
    {
        name: {
            required: true,
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["lost", "found"],
            default: "lost"
        },
        description: {
            type: String,
            enum: ["clothing", "electronics", "books", "buzzcard", "pets", "other"],
        },
        location_pin: {
            type: String,
            trim: true,
        },
        location_details: {
            type: String,
            trim: true,
        },
        person_found: {
            type: ObjectId
        },
        person_lost: {
            type: ObjectId
        },
        lostdate: {
            type: Date,
            default: Date.now
        }
    }
);

export default mongoose.models?.Item ??
    mongoose.model("Item", ItemSchema);
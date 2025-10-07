import mongoose, { InferSchemaType, Schema } from "mongoose";
import User from "./User";
import { ObjectId } from "mongodb";

const ItemSchema = new Schema(
    {
        title: {
            required: true,
            type: String,
            trime: true,
        },
        isLost: {
            required: true,
            type: Boolean,
            default: false // true if lost, false if found
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
            lng: {
                type: Number,
                required: true
            }
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
        },
        contact_info: {
            type: String
        },
        comments: {
            type: String
        }
    }
);
type Item = InferSchemaType<typeof ItemSchema>& {
    _id: ObjectId;
};
export type { Item };

export default mongoose.models?.Item ??
    mongoose.model<Item>("Item", ItemSchema);
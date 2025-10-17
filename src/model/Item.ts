import mongoose, { InferSchemaType, Schema } from "mongoose";
import { ObjectId } from "mongodb";

const ItemSchema = new Schema(
    {
        title: {
            required: true,
            type: String,
            trim: true,
        },
        isLost: {
            required: true,
            type: Boolean,
            default: false // true if lost, false if found
        },
        image: {
            id: { type: String },
            url: { type: String },
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
            enum: ["electronics", "buzzcard", "bags", "clothing", "books", "personal", "misc"],
            default: "misc"
        },
        position: {
            type: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
            required: true,
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
    },
    { timestamps: true }
);

type Item = InferSchemaType<typeof ItemSchema> & {
    _id: ObjectId;
};

export type { Item };

export default mongoose.models?.Item ??
    mongoose.model<Item>("Item", ItemSchema);
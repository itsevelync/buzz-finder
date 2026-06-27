import { Schema, model, models } from "mongoose";

export interface IItemMatch {
    userId: Schema.Types.ObjectId;
    lostItemId: Schema.Types.ObjectId;
    foundItemId: Schema.Types.ObjectId;
}

const ItemMatchSchema = new Schema<IItemMatch>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        lostItemId: {
            type: Schema.Types.ObjectId,
            ref: "LostItemPost",
            required: true,
            unique: true,
        },
        foundItemId: {
            type: Schema.Types.ObjectId,
            ref: "Item",
            required: true,
            unique: true,
        },
    }, { timestamps: true });

const ItemMatch = models.ItemMatch || model<IItemMatch>("ItemMatch", ItemMatchSchema);

export default ItemMatch;

import { Schema, model, models } from "mongoose";

export interface IResetCode {
    userId: Schema.Types.ObjectId;
    code: string;
    expiresAt: Date;
}

const ResetCodeSchema = new Schema<IResetCode>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: "0s" }, // This makes Mongoose automatically delete documents when expiresAt is reached
        },
    }, { timestamps: true });

const ResetCode = models.ResetCode || model<IResetCode>("ResetCode", ResetCodeSchema);

export default ResetCode;

import { Schema, model, models } from "mongoose";

export interface IVerificationCode {
    email: string;
    code: string;
    expiresAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
    email: {
        type: String,
        required: true,
        ref: "User",
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

const VerificationCode = models.VerificationCode || model<IVerificationCode>("VerificationCode", VerificationCodeSchema);

export default VerificationCode;

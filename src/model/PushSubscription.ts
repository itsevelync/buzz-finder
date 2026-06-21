import mongoose, { InferSchemaType, Schema } from "mongoose";

const PushSubscriptionSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        endpoint: { type: String, required: true, unique: true },
        keys: {
            p256dh: String,
            auth: String,
        },
        userAgent: String,
    },
    { timestamps: true },
);

export type PushSubscription = InferSchemaType<typeof PushSubscriptionSchema>;

export default mongoose.models?.PushSubscription ??
    mongoose.model("PushSubscription", PushSubscriptionSchema);

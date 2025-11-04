import mongoose, { Schema } from "mongoose";

const ResetCodeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        code: {
            type: String,
            required: true,
            validate: {
                validator: function (v: string) {
                    return /^\d{6}$/.test(v); // Must be exactly 6 digits
                },
                message: (props: mongoose.ValidatorProps) => `${props.value} is not a valid 6-digit reset code`,
            },
        },
    },
    { timestamps: true }
);

// TTL index: expires 900 seconds (15 minutes) after last code change
ResetCodeSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 900 });

// Only update `updatedAt` if `code` changes
ResetCodeSchema.pre("save", function (next) {
    if (this.isModified("code")) {
        this.updatedAt = new Date();
    } else {
        this.updatedAt = this.get("updatedAt", null);
    }
    next();
});

export default mongoose.models?.ResetCode ??
    mongoose.model("ResetCode", ResetCodeSchema);

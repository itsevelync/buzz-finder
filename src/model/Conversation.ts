import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ConversationSchema: Schema = new Schema({
    participantIds: [{ type: String, required: true }],
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

export type ConversationType = Omit<
    InferSchemaType<typeof ConversationSchema>,
    'participantIds' | 'lastMessageAt'
> & {
    _id: string;
    participantIds: string[];
    lastMessageAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export default mongoose.models?.Conversation ??
    mongoose.model("Conversation", ConversationSchema);
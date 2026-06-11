import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ParticipantSchema = new Schema({
    userId: { type: String, required: true },
    lastReadAt: { type: Date, default: Date.now }
}, { _id: false });

const ConversationSchema: Schema = new Schema({
    participants: [ParticipantSchema],
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

export type ConversationType = Omit<
    InferSchemaType<typeof ConversationSchema>,
    'participants' | 'lastMessageAt'
> & {
    _id: string;
    participants: { userId: string; lastReadAt: Date | string }[];
    lastMessageAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export default mongoose.models?.Conversation ??
    mongoose.model("Conversation", ConversationSchema);
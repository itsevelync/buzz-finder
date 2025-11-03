import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IConversation extends Document {
    participantIds: string[];
    lastMessageAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participantIds: [{ type: String, required: true }], 
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Conversation: Model<IConversation> = models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
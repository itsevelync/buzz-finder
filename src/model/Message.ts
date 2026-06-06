import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  senderId: string;
  conversationId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  text: { type: String, required: true },
  senderId: { type: String, required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
}, { timestamps: true });

const Message: Model<IMessage> = models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;

// src/interfaces/Message.ts
export interface IMessage {
  message: string;
  timestamp: Date;
  fullError?: any; // Could be more specific if you know the error structure
}
// src/models/MessageModel.ts
import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema<IMessage>({
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fullError: {
    type: Schema.Types.Mixed 
  }
}, {
  timestamps: false, 
  versionKey: false
});

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
// src/repositories/MessageRepository.ts
import { MessageModel,IMessage } from "../models/Message";

export class MessageRepository {
  async createMessage(messageData: Omit<IMessage, 'timestamp'> & { timestamp?: Date }) {
    try {
      // If timestamp isn't provided, it will use the default (Date.now)
      const newMessage = new MessageModel(messageData);
      return await newMessage.save();
    } catch (error) {
      // You might want to log this error or handle it differently
      throw error;
    }
  }

  async getAllMessages() {
    try {
      return await MessageModel.find().sort({ timestamp: -1 }).exec();
    } catch (error) {
      throw error;
    }
  }

  async getMessagesByTimeRange(startDate: Date, endDate: Date) {
    try {
      return await MessageModel.find({
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort({ timestamp: -1 }).exec();
    } catch (error) {
      throw error;
    }
  }

  async deleteOldMessages(beforeDate: Date) {
    try {
      return await MessageModel.deleteMany({ timestamp: { $lt: beforeDate } }).exec();
    } catch (error) {
      throw error;
    }
  }
}
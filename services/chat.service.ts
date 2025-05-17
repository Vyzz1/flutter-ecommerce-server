import mongoose from "mongoose";
import Chat from "../models/chat.model";
import Conversation from "../models/conversation.model";

class ChatService {
  async createMessage(messageData: any) {
    try {
      const chat = new Chat(messageData);
      await chat.save();
      return chat;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  async getAllConversations() {
    try {
      return await Conversation.find()
        .sort({ lastMessageAt: -1 })
        .populate("user", "fullName avatar _id")
        .lean();
    } catch (error) {
      console.error("Error getting conversations:", error);
      throw error;
    }
  }

  async getMessagesByConversation(conversationId: string) {
    try {
      return await Chat.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .populate("sender", "fullName avatar _id")
        .select("-__v")
        .lean();
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  async getRecentMessages(conversationId: string, limit = 20) {
    try {
      return await Chat.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sender", "name")
        .lean();
    } catch (error) {
      console.error("Error getting recent messages:", error);
      throw error;
    }
  }

  async markConversationSeen(conversationId: string, userId: string) {
    try {
      await Conversation.findByIdAndUpdate(conversationId, {
        $addToSet: { seenBy: userId },
      });

      return true;
    } catch (error) {
      console.error("Error marking messages as seen:", error);
      throw error;
    }
  }

  async getUserConversations(userId: string) {
    try {
      const conversations = await Conversation.find({
        user: userId,
      })
        .sort({ lastMessageAt: -1 })
        .populate("seenBy", "lastMessageSenderId")
        .lean();

      return conversations;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw error;
    }
  }

  async updateConversation(conversationId: string, updateData: any) {
    try {
      return await Conversation.findByIdAndUpdate(conversationId, updateData, {
        new: true,
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw error;
    }
  }
}

export default new ChatService();

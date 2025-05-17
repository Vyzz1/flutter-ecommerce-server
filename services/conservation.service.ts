import Chat from "../models/chat.model";
import Conversation from "../models/conversation.model";
import User from "../models/user.model";

class ConversationService {
  deleteConversation(id: string) {
    try {
      const conversation = Conversation.findByIdAndDelete(id).exec();

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      Chat.deleteMany({ conversation: id }).exec();

      return conversation;
    } catch (error) {
      throw error;
    }
  }
  constructor() {}

  async createConversation(email: string) {
    try {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new Error("User not found");
      }

      const newConversation = await Conversation.create({ user: user._id });
      return newConversation;
    } catch (error) {
      throw error;
    }
  }

  async getUserConversation(userId: string) {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error("User not found");
      }

      const conversation = await Conversation.findOne({
        user: user._id,
      }).exec();

      if (!conversation) {
        const newConversation = await Conversation.create({ user: user._id });
        return newConversation.id;
      }

      return conversation.id;
    } catch (error) {
      throw error;
    }
  }
}

export default new ConversationService();

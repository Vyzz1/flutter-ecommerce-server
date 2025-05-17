"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = __importDefault(require("../models/chat.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
class ChatService {
    createMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = new chat_model_1.default(messageData);
                yield chat.save();
                return chat;
            }
            catch (error) {
                console.error("Error creating message:", error);
                throw error;
            }
        });
    }
    getAllConversations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield conversation_model_1.default.find()
                    .sort({ lastMessageAt: -1 })
                    .populate("user", "fullName avatar _id")
                    .lean();
            }
            catch (error) {
                console.error("Error getting conversations:", error);
                throw error;
            }
        });
    }
    getMessagesByConversation(conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield chat_model_1.default.find({ conversation: conversationId })
                    .sort({ createdAt: 1 })
                    .populate("sender", "fullName avatar _id")
                    .select("-__v")
                    .lean();
            }
            catch (error) {
                console.error("Error getting messages:", error);
                throw error;
            }
        });
    }
    getRecentMessages(conversationId_1) {
        return __awaiter(this, arguments, void 0, function* (conversationId, limit = 20) {
            try {
                return yield chat_model_1.default.find({ conversation: conversationId })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .populate("sender", "name")
                    .lean();
            }
            catch (error) {
                console.error("Error getting recent messages:", error);
                throw error;
            }
        });
    }
    markConversationSeen(conversationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield conversation_model_1.default.findByIdAndUpdate(conversationId, {
                    $addToSet: { seenBy: userId },
                });
                return true;
            }
            catch (error) {
                console.error("Error marking messages as seen:", error);
                throw error;
            }
        });
    }
    getUserConversations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conversations = yield conversation_model_1.default.find({
                    user: userId,
                })
                    .sort({ lastMessageAt: -1 })
                    .populate("seenBy", "lastMessageSenderId")
                    .lean();
                return conversations;
            }
            catch (error) {
                console.error("Error getting user conversations:", error);
                throw error;
            }
        });
    }
    updateConversation(conversationId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield conversation_model_1.default.findByIdAndUpdate(conversationId, updateData, {
                    new: true,
                });
            }
            catch (error) {
                console.error("Error updating conversation:", error);
                throw error;
            }
        });
    }
}
exports.default = new ChatService();

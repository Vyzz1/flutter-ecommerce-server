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
const user_model_1 = __importDefault(require("../models/user.model"));
class ConversationService {
    deleteConversation(id) {
        try {
            const conversation = conversation_model_1.default.findByIdAndDelete(id).exec();
            if (!conversation) {
                throw new Error("Conversation not found");
            }
            chat_model_1.default.deleteMany({ conversation: id }).exec();
            return conversation;
        }
        catch (error) {
            throw error;
        }
    }
    constructor() { }
    createConversation(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ email }).exec();
                if (!user) {
                    throw new Error("User not found");
                }
                const newConversation = yield conversation_model_1.default.create({ user: user._id });
                return newConversation;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserConversation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findById(userId).exec();
                if (!user) {
                    throw new Error("User not found");
                }
                const conversation = yield conversation_model_1.default.findOne({
                    user: user._id,
                }).exec();
                if (!conversation) {
                    const newConversation = yield conversation_model_1.default.create({ user: user._id });
                    return newConversation.id;
                }
                return conversation.id;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new ConversationService();

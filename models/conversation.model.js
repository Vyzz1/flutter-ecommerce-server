"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const { ObjectId } = mongoose_1.Schema.Types;
const ConversationSchema = new mongoose_1.Schema({
    user: { type: ObjectId, ref: "User", unique: true },
    lastMessage: { type: String, required: false },
    lastMessageAt: { type: Date, required: false },
    seenBy: [{ type: ObjectId, ref: "User", required: false }],
    createdAt: { type: Date, default: Date.now },
    lastMessageSenderId: { type: ObjectId, ref: "User", required: false },
});
const Conversation = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Conversation) || (0, mongoose_1.model)("Conversation", ConversationSchema);
exports.default = Conversation;

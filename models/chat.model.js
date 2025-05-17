"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatModelSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    conversation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    images: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    content: {
        type: String,
        required: true,
    },
    seenBy: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
});
const Chat = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Chat) || (0, mongoose_1.model)("Chat", chatModelSchema);
exports.default = Chat;

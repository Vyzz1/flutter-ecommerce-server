"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        minLength: [6, "Password is too short"],
    },
    loyaltyPoint: {
        type: Number,
        required: false,
        default: 0,
    },
    gender: {
        type: String,
        required: false,
        enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
        type: String,
        required: false,
    },
    fullName: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: true,
        enum: ["customer", "admin"],
        default: "customer",
    },
    avatar: {
        type: String,
        required: false,
    },
    isBanned: {
        type: Boolean,
        required: false,
        default: false,
    },
    isCreateFromAnonymousOrder: {
        type: Boolean,
        required: false,
        default: false,
    },
    refreshToken: {
        type: String,
        required: false,
    },
    conversation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Conversation",
    },
}, {
    timestamps: true,
});
const User = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.User) || (0, mongoose_1.model)("User", userSchema);
exports.default = User;

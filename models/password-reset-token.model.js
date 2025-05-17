"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const passwordResetTokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
});
const PasswordResetToken = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.PasswordResetToken) ||
    (0, mongoose_1.model)("PasswordResetToken", passwordResetTokenSchema);
exports.default = PasswordResetToken;

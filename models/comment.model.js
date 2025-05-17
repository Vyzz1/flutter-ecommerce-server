"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: [true, "Comment content is required"],
        trim: true,
        maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    label: {
        type: String,
        enum: ["Positive", "Negative", "Neutral"],
        default: "neutral",
    },
    guestInfo: {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
    },
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
    },
}, {
    timestamps: true,
});
commentSchema.pre("validate", function (next) {
    if (!this.user &&
        (!this.guestInfo || !this.guestInfo.name || !this.guestInfo.email)) {
        this.invalidate("user", "Either a user ID or guest information is required");
    }
    next();
});
const Comment = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Comment) || (0, mongoose_1.model)("Comment", commentSchema);
exports.default = Comment;

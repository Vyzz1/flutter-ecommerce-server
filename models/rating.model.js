"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ratingSchema = new mongoose_1.Schema({
    variant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductVariant",
    },
    images: {
        type: [String],
        required: false,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
    label: {
        type: String,
        enum: ["Positive", "Negative", "Neutral"],
        default: "neutral",
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});
const Rating = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Rating) || (0, mongoose_1.model)("Rating", ratingSchema);
exports.default = Rating;

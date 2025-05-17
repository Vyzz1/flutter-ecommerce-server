"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shoppingCartItemSchema = new mongoose_1.Schema({
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1."],
    },
    variant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
}, { timestamps: true });
shoppingCartItemSchema.index({ variant: 1, user: 1 }, { unique: true });
const ShoppingCartItem = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.ShoppingCartItem) || (0, mongoose_1.model)("ShoppingCartItem", shoppingCartItemSchema);
exports.default = ShoppingCartItem;

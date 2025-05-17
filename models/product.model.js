"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: String,
    description: {
        type: String,
        minlength: [3, "Description must be at least 3 characters"],
    },
    attributes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Attribute",
        },
    ],
    variants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "ProductVariant",
        },
    ],
    avgRating: {
        type: Number,
        default: 0,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    minDiscount: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
    },
    brand: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Brand",
    },
}, { timestamps: true });
const Product = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Product) || (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productVariantSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
    },
    variantName: {
        type: String,
        required: false,
    },
    images: {
        type: [String],
        required: false,
    },
    basePrice: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    discount: { type: Number, default: 0 },
    attributes: [
        {
            attribute: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Attribute",
            },
            value: {
                type: String,
                required: true,
            },
        },
    ],
}, {
    timestamps: true,
});
const ProductVariant = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.ProductVariant) || (0, mongoose_1.model)("ProductVariant", productVariantSchema);
exports.default = ProductVariant;

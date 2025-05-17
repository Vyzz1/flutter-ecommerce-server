"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderDetailsSchema = new mongoose_1.Schema({
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be greater than 0"],
    },
    isRated: {
        type: Boolean,
        default: false,
    },
    variantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: false,
    },
    attributes: [
        {
            name: {
                type: String,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        },
    ],
    productName: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: false,
        default: 0,
    },
    price: {
        type: Number,
        required: true,
    },
    basePrice: {
        type: Number,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
}, { timestamps: true });
const OrderDetails = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.OrderDetails) || (0, mongoose_1.model)("OrderDetails", orderDetailsSchema);
exports.default = OrderDetails;

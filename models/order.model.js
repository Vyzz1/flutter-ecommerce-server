"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    user: {
        ref: "User",
        required: true,
        type: mongoose_1.Schema.Types.ObjectId,
    },
    details: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "OrderDetails", required: true },
    ],
    statuses: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "OrderStatus", required: true },
    ],
    currentStatus: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        required: true,
    },
    discountCode: {
        type: String,
        required: false,
    },
    loyaltyPoint: {
        type: Number,
        required: false,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
}, { timestamps: true });
const Order = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Order) || (0, mongoose_1.model)("Order", orderSchema);
exports.default = Order;

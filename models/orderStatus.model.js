"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderStatusSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        required: true,
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const OrderStatus = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.OrderStatus) || (0, mongoose_1.model)("OrderStatus", orderStatusSchema);
exports.default = OrderStatus;

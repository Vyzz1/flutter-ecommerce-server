"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const couponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{5}$/.test(v);
            },
        },
        uppercase: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    count: {
        type: Number,
        required: false,
        default: 0,
    },
    limit: {
        type: Number,
        required: true,
    },
    order: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
}, { timestamps: true });
const Coupon = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Coupon) || (0, mongoose_1.model)("Coupon", couponSchema);
exports.default = Coupon;

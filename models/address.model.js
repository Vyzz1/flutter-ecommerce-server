"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    fullAddress: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Address = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Address) || (0, mongoose_1.model)("Address", addressSchema);
exports.default = Address;

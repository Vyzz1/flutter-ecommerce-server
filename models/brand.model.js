"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const brandSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});
const Brand = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Brand) || (0, mongoose_1.model)("Brand", brandSchema);
exports.default = Brand;

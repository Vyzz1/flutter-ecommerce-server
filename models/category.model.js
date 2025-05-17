"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const Category = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Category) || (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;

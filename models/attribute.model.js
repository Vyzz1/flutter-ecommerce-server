"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const attributeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
});
const Attribute = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Attribute) || (0, mongoose_1.model)("Attribute", attributeSchema);
exports.default = Attribute;

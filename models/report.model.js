"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const monthlyReportSchema = new mongoose_1.Schema({
    totalRevenue: {
        type: Number,
        default: 0,
    },
    totalCost: {
        type: Number,
        default: 0,
    },
    profit: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const Reports = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.MonthlyReport) || (0, mongoose_1.model)("Report", monthlyReportSchema);
exports.default = Reports;

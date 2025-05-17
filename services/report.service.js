"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_model_1 = __importDefault(require("../models/report.model"));
class ReporstService {
    updateReport(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date(order.createdAt);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            let revenue = 0;
            let cost = 0;
            for (const detail of order.details) {
                revenue += detail.price * detail.quantity;
                cost += (detail.basePrice || 0) * detail.quantity;
            }
            const profit = revenue - cost;
            const report = yield report_model_1.default.findOneAndUpdate({
                createdAt: { $gte: monthStart, $lt: nextMonthStart },
            }, {
                $inc: {
                    totalRevenue: revenue,
                    totalCost: cost,
                    profit: profit,
                },
            }, {
                upsert: true,
                new: true,
            });
            console.log(`✅ Report updated for ${date.toISOString().slice(0, 7)}: Revenue = ${report.totalRevenue}, Cost = ${report.totalCost}, Profit = ${report.profit}`);
        });
    }
}
exports.default = new ReporstService();

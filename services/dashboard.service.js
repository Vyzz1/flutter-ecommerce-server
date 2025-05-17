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
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const report_model_1 = __importDefault(require("../models/report.model"));
class DashboardService {
    constructor() {
        this.getDefaultAnnualRange = () => {
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
            return { startDate, endDate };
        };
        this.isValidDate = (date) => {
            return date !== null && !isNaN(new Date(date).getTime());
        };
    }
    getStats(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let startDate, endDate;
                if (!this.isValidDate(fromDate) ||
                    !this.isValidDate(toDate)) {
                    ({ startDate, endDate } = this.getDefaultAnnualRange());
                }
                else {
                    startDate = new Date(fromDate);
                    endDate = new Date(toDate);
                }
                const totalOrders = yield order_model_1.default.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate },
                    currentStatus: { $ne: "Cancelled" },
                });
                const reportStats = yield report_model_1.default.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalProfit: { $sum: "$profit" },
                            totalRevenue: { $sum: "$totalRevenue" },
                            totalCost: { $sum: "$totalCost" },
                        },
                    },
                ]);
                const totalUsers = yield order_model_1.default.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate },
                });
                const totalProducts = yield product_model_1.default.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate },
                });
                const stats = {
                    totalOrders: totalOrders || 0,
                    totalRevenue: ((_a = reportStats[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0,
                    totalCost: ((_b = reportStats[0]) === null || _b === void 0 ? void 0 : _b.totalCost) || 0,
                    totalProfit: ((_c = reportStats[0]) === null || _c === void 0 ? void 0 : _c.totalProfit) || 0,
                    totalUsers: totalUsers || 0,
                    totalProducts: totalProducts || 0,
                };
                return stats;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getChartComparison(fromDate, toDate, groupBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let startDate, endDate;
                if (!this.isValidDate(fromDate) ||
                    !this.isValidDate(toDate)) {
                    ({ startDate, endDate } = this.getDefaultAnnualRange());
                }
                else {
                    startDate = new Date(fromDate);
                    endDate = new Date(toDate);
                }
                let dateFormat;
                let dateTrunc;
                switch (groupBy) {
                    case "year":
                        dateFormat = { $year: "$createdAt" };
                        dateTrunc = { year: { $year: "$createdAt" } };
                        break;
                    case "quarter":
                        dateFormat = {
                            year: { $year: "$createdAt" },
                            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
                        };
                        dateTrunc = {
                            year: { $year: "$createdAt" },
                            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
                        };
                        break;
                    case "month":
                        dateFormat = {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        };
                        dateTrunc = {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        };
                        break;
                    case "week":
                        dateFormat = {
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" },
                        };
                        dateTrunc = {
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" },
                        };
                        break;
                    default:
                        dateFormat = { $year: "$createdAt" };
                        dateTrunc = { year: { $year: "$createdAt" } };
                }
                const orderChart = yield order_model_1.default.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                            currentStatus: { $ne: "Cancelled" },
                        },
                    },
                    {
                        $lookup: {
                            from: "orderdetails",
                            localField: "details",
                            foreignField: "_id",
                            as: "orderDetails",
                        },
                    },
                    {
                        // Aggregate profit data from Report
                        $unwind: {
                            path: "$orderDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $group: {
                            _id: dateTrunc,
                            totalRevenue: { $sum: "$totalAmount" },
                            totalProductsSold: { $sum: "$orderDetails.quantity" },
                        },
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.quarter": 1,
                            "_id.month": 1,
                            "_id.week": 1,
                        },
                    },
                ]);
                const profitChart = yield report_model_1.default.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                        },
                    },
                    {
                        $group: {
                            _id: dateTrunc,
                            totalProfit: { $sum: "$profit" },
                        },
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.quarter": 1,
                            "_id.month": 1,
                            "_id.week": 1,
                        },
                    },
                ]);
                // Aggregate product categories sold
                const categoryChart = yield order_model_1.default.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate },
                            currentStatus: { $ne: "Cancelled" },
                        },
                    },
                    {
                        $lookup: {
                            from: "orderdetails",
                            localField: "details",
                            foreignField: "_id",
                            as: "orderDetails",
                        },
                    },
                    {
                        $unwind: "$orderDetails",
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "orderDetails.productId",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $lookup: {
                            from: "categories",
                            localField: "product.category",
                            foreignField: "_id",
                            as: "category",
                        },
                    },
                    {
                        $unwind: "$category",
                    },
                    {
                        $group: {
                            _id: { time: dateTrunc, category: "$category.name" },
                            totalSold: { $sum: "$orderDetails.quantity" },
                        },
                    },
                    {
                        $group: {
                            _id: "$_id.time",
                            categories: {
                                $push: {
                                    name: "$_id.category",
                                    totalSold: "$totalSold",
                                },
                            },
                        },
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.quarter": 1,
                            "_id.month": 1,
                            "_id.week": 1,
                        },
                    },
                ]);
                const chartData = orderChart.map((order) => {
                    var _a, _b;
                    return ({
                        time: order._id,
                        revenue: order.totalRevenue,
                        productsSold: order.totalProductsSold,
                        profit: ((_a = profitChart.find((p) => JSON.stringify(p._id) === JSON.stringify(order._id))) === null || _a === void 0 ? void 0 : _a.totalProfit) || 0,
                        categories: ((_b = categoryChart.find((c) => JSON.stringify(c._id) === JSON.stringify(order._id))) === null || _b === void 0 ? void 0 : _b.categories) || [],
                    });
                });
                return chartData;
            }
            catch (error) {
                console.error("Error in getChartComparison:", error);
                throw error;
            }
        });
    }
}
exports.default = new DashboardService();

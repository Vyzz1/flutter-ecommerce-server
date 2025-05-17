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
const dashboard_service_1 = __importDefault(require("../services/dashboard.service"));
const handleGetStats = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fromDate, toDate } = request.query;
        const response = yield dashboard_service_1.default.getStats(fromDate, toDate);
        reply.status(200).send(response);
    }
    catch (error) {
        console.error("Error fetching stats:", error);
        reply.status(500).send({ error: "Internal Server Error" });
    }
});
const handleGetChartComparison = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fromDate, toDate, groupBy } = request.query;
        const response = yield dashboard_service_1.default.getChartComparison(fromDate, toDate, groupBy);
        reply.status(200).send(response);
    }
    catch (error) {
        console.error("Error fetching chart comparison:", error);
        reply.status(500).send({ error: "Internal Server Error" });
    }
});
exports.default = {
    handleGetStats,
    handleGetChartComparison,
};

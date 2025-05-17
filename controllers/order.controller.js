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
const ErrorResponse_1 = require("../errors/ErrorResponse");
const order_service_1 = __importDefault(require("../services/order.service"));
const handleCreateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const order = yield order_service_1.default.createOrderForUser(email, req.body);
        return order;
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleCreateOrderForAnonymous = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_service_1.default.createOrderForAnonymousUser(req.body);
        return order;
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const role = req.user.role;
        // if (role !== "admin") {
        //   return res.status(403).send({ message: "Forbidden" });
        // }
        const orders = yield order_service_1.default.getAllOrders(req.query);
        return orders;
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleChangeOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = yield order_service_1.default.updateOrderStatus(id, status);
        return order;
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleDeleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield order_service_1.default.deleteOrder(id);
        return res.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetOrderForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, status } = req.query;
        const order = yield order_service_1.default.getOrderForUser(userId, status);
        return order;
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleCountOrderForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const order = yield order_service_1.default.getCountOrders(userId);
        return order;
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
exports.default = {
    handleCreateOrder,
    handleCreateOrderForAnonymous,
    handleGetAllOrders,
    handleChangeOrderStatus,
    handleDeleteOrder,
    handleGetOrderForUser,
    handleCountOrderForUser,
};

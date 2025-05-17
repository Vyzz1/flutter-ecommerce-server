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
const shoppingCart_service_1 = __importDefault(require("../services/shoppingCart.service"));
const ErrorResponse_1 = require("../errors/ErrorResponse");
const handleCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user.id;
        const cart = yield shoppingCart_service_1.default.createShoppingCart(user, req.body);
        return res.status(201).send(cart);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield shoppingCart_service_1.default.deleteShoppingCart(id);
        return res.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendError(res, error, 400);
    }
});
const handleGetByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const cart = yield shoppingCart_service_1.default.getShoppingCart(userId);
        return res.status(200).send(cart);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendError(res, error, 400);
    }
});
const handleUpdateQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield shoppingCart_service_1.default.updateShoppingCart(req.params.id, req.body.quantity);
        return res.status(200).send(cart);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetForAnonymous = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield shoppingCart_service_1.default.getShoppingCartForAnonymousUser(req.body);
        console.log(cart);
        return res.status(200).send(cart);
    }
    catch (error) {
        console.error(error);
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
exports.default = {
    handleCreate,
    handleDelete,
    handleGetByUser,
    handleUpdateQuantity,
    handleGetForAnonymous,
};

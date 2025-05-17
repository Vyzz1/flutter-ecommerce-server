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
const admin_service_1 = __importDefault(require("../services/admin.service"));
const elasticSearch_service_1 = __importDefault(require("../services/elasticSearch.service"));
const handleGetAllUsers = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield admin_service_1.default.getAllUser();
        return reply.status(200).send(users || []);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleBanUser = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const user = yield admin_service_1.default.banUser(id);
        return reply.status(200).send(user);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleUnBanUser = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const user = yield admin_service_1.default.unBanUser(id);
        return reply.status(200).send(user);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleUpdateUser = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const updatedUser = yield admin_service_1.default.updateUser(id, request.body);
        return reply.status(200).send(updatedUser);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleDeleteUser = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield admin_service_1.default.deleteUser(id);
        return reply.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetAllProducts = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield admin_service_1.default.getAllProducts(request.query);
        return reply.status(200).send(products || []);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleDeleteProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield admin_service_1.default.deleteProduct(id);
        elasticSearch_service_1.default.deleteProduct(id);
        return reply.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
exports.default = {
    handleGetAllUsers,
    handleDeleteProduct,
    handleUpdateUser,
    handleBanUser,
    handleDeleteUser,
    handleUnBanUser,
    handleGetAllProducts,
};

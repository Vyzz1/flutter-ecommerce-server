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
const product_service_1 = __importDefault(require("../services/product.service"));
const handleCreateProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_service_1.default.createProduct(request.body);
        return reply.status(201).send(product);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetProductDetails = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const product = yield product_service_1.default.getProductDetails(id);
        return reply.status(200).send(product);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleUpdateProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedProduct = yield product_service_1.default.updateProduct(request.params.id, request.body);
        return reply.status(200).send(updatedProduct);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleDeleteProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield product_service_1.default.deleteProduct(request.params.id);
        return reply.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleFilterProducts = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.filterProducts(request.query);
        return reply.status(200).send(products);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetHomeProducts = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getHomepageProducts();
        return reply.status(200).send(products);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
exports.default = {
    handleCreateProduct,
    handleGetProductDetails,
    handleDeleteProduct,
    handleUpdateProduct,
    handleFilterProducts,
    handleGetHomeProducts,
};

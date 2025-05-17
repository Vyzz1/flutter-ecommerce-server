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
const brand_service_1 = __importDefault(require("../services/brand.service"));
const handleCreateBrand = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = request.body;
        const brand = yield brand_service_1.default.createBrand(name);
        return reply.status(201).send(brand);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetBrands = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brands = yield brand_service_1.default.getBrands();
        return reply.status(200).send(brands);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleDeleteBrand = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const brand = yield brand_service_1.default.deleteBrand(id);
        return reply.status(200).send(brand);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleUpdateBrand = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const { name } = request.body;
        console.log("update brand", id, name);
        const brand = yield brand_service_1.default.updateBrand(id, name);
        return reply.status(200).send(brand);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
exports.default = {
    handleCreateBrand,
    handleGetBrands,
    handleDeleteBrand,
    handleUpdateBrand,
};

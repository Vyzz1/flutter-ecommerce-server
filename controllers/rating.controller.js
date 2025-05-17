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
const rating_service_1 = __importDefault(require("../services/rating.service"));
const handleCreateRating = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const rating = request.body;
    const userEmail = request.user.email;
    try {
        const newRating = yield rating_service_1.default.createRating(rating, userEmail);
        return reply.send(newRating);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetTwoFirstRating = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = request.params.id;
    try {
        const ratings = yield rating_service_1.default.getTwoFirstRating(productId);
        return reply.send(ratings);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
const handleGetAllRating = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = request.params.id;
    try {
        const ratings = yield rating_service_1.default.getAllRating(productId);
        return reply.send(ratings);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(reply, error);
    }
});
exports.default = {
    handleCreateRating,
    handleGetTwoFirstRating,
    handleGetAllRating,
};

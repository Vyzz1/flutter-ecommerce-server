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
const conservation_service_1 = __importDefault(require("../services/conservation.service"));
const ErrorResponse_1 = require("../errors/ErrorResponse");
const handleCreateConservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.user;
        const response = yield conservation_service_1.default.createConversation(email);
        res.status(201).send(response);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetUserConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const response = yield conservation_service_1.default.getUserConversation(id);
        res.status(200).send(response);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleDeleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield conservation_service_1.default.deleteConversation(id);
        res.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
exports.default = {
    handleCreateConservation,
    handleGetUserConversation,
    handleDeleteConversation,
};

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
const comment_service_1 = __importDefault(require("../services/comment.service"));
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_service_1.default.createComment(req.body);
        return res.status(201).send(comment);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetCommentsByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_service_1.default.getCommentsByProduct(req.params.id);
        return res.status(200).send(comments);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetTwoComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_service_1.default.getFirstTwoComments(req.params.id);
        return res.status(200).send(comments);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
exports.default = {
    addComment,
    handleGetCommentsByProduct,
    handleGetTwoComments,
};

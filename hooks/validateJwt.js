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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorResponse_1 = require("../errors/ErrorResponse");
const validateJwt = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = request.headers.authorization;
    if (!auth) {
        throw new Error("Unauthorized");
    }
    const token = auth === null || auth === void 0 ? void 0 : auth.split(" ")[1];
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, err.message, 401);
        }
        request.user = {
            email: decoded.email,
            role: decoded.role,
            id: decoded.id,
        };
    });
});
exports.default = validateJwt;

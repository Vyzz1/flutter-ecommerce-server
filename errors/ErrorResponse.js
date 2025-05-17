"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponse = void 0;
const AgrumentError_1 = __importDefault(require("./AgrumentError"));
class ErrorResponse {
    constructor(message, status, timestamp) {
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
    }
    static sendError(reply, message, status = 400) {
        const er = new ErrorResponse(message, status, new Date());
        reply.status(status).send(er);
        return;
    }
    static sendServerError(reply) {
        return this.sendError(reply, "Internal Server Error", 500);
    }
    static sendNotFound(reply, message) {
        return this.sendError(reply, message, 404);
    }
    static sendErrorWithDetails(reply, error) {
        var _a;
        console.error(error);
        if (error instanceof AgrumentError_1.default) {
            return ErrorResponse.sendError(reply, error.message, (_a = error.statusCode) !== null && _a !== void 0 ? _a : 400);
        }
        return ErrorResponse.sendServerError(reply);
    }
}
exports.ErrorResponse = ErrorResponse;

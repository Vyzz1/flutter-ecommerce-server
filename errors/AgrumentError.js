"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArgumentError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ArgumentError";
    }
}
exports.default = ArgumentError;

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
const password_rest_controller_1 = __importDefault(require("../controllers/password-rest.controller"));
const schema_1 = require("../schema");
const passwordRouter = (fastify, opts) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.post("/forgot", {
        handler: password_rest_controller_1.default.handleSendOTP,
        schema: Object.assign({ body: {
                type: "object",
                required: ["email"],
                properties: {
                    email: { type: "string", format: "email" },
                },
            } }, (0, schema_1.commonResponseSchema)({ token: { type: "string" } })),
    });
    fastify.post("/validate", {
        handler: password_rest_controller_1.default.handleValidateOTP,
        schema: Object.assign({ body: {
                type: "object",
                required: ["token", "otp"],
                properties: {
                    token: { type: "string" },
                    otp: { type: "string" },
                },
            } }, (0, schema_1.commonResponseSchema)({ token: { type: "string" } })),
    });
    fastify.post("/reset", {
        handler: password_rest_controller_1.default.handleResetPassword,
        schema: Object.assign({ body: {
                type: "object",
                required: ["token", "password"],
                properties: {
                    token: { type: "string" },
                    password: { type: "string" },
                },
            } }, (0, schema_1.commonResponseSchema)({ message: { type: "string" } })),
    });
});
exports.default = passwordRouter;

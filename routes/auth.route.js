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
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const authRouter = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.post("/register", {
        handler: auth_controller_1.default.handleRegister,
        schema: Object.assign(Object.assign({}, (0, schema_1.commonResponseSchema)({ message: { type: "string" } }, 201)), { body: {
                type: "object",
                required: ["email", "password", "fullName", "fullAddress"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    fullName: { type: "string" },
                    fullAddress: { type: "string" },
                },
            } }),
    });
    fastify.post("/login", {
        handler: auth_controller_1.default.handleLogin,
        schema: Object.assign(Object.assign({}, schema_1.errorResponseSchema), { body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                },
            } }),
    });
    fastify.get("/", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: auth_controller_1.default.hanldeGetUser, schema: Object.assign({}, (0, schema_1.commonResponseSchema)(schema_1.userSchema)) }));
    fastify.get("/refresh", {
        handler: auth_controller_1.default.handleRefresh,
        schema: Object.assign({}, (0, schema_1.commonResponseSchema)({ accessToken: { type: "string" } })),
    });
    fastify.patch("/update", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: auth_controller_1.default.handleUpdateInformation, schema: Object.assign(Object.assign({}, (0, schema_1.commonResponseSchema)(schema_1.userSchema)), { body: {
                type: "object",
                required: ["fullName"],
                properties: {
                    fullName: { type: "string" },
                    avatar: { type: "string" },
                },
            } }) }));
    fastify.post("/update-password", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: auth_controller_1.default.handleUpdatePassword, schema: Object.assign(Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { body: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                    currentPassword: { type: "string" },
                    newPassword: { type: "string" },
                },
            } }), (0, schema_1.commonResponseSchema)({ message: { type: "string" } })) }));
    fastify.get("/logout", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: auth_controller_1.default.handleLogout, schema: Object.assign({}, (0, schema_1.commonResponseSchema)({ message: { type: "string" } })) }));
});
exports.default = authRouter;

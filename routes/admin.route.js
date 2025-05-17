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
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const adminRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    auth_1.default.roleRequiredHook(fastify, "admin");
    fastify.get("/users", {
        handler: admin_controller_1.default.handleGetAllUsers,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.userSchema)),
    });
    fastify.delete("/users/:id", {
        handler: admin_controller_1.default.handleDeleteUser,
        schema: Object.assign({}, schema_1.requiredIdParam),
    });
    fastify.post("/users/:id/ban", {
        handler: admin_controller_1.default.handleBanUser,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.commonResponseSchema)(schema_1.userSchema)),
    });
    fastify.post("/users/:id/unban", {
        handler: admin_controller_1.default.handleUnBanUser,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.commonResponseSchema)(schema_1.userSchema)),
    });
    fastify.patch("/users/:id", {
        handler: admin_controller_1.default.handleUpdateUser,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.commonResponseSchema)(schema_1.userSchema)),
    });
    fastify.get("/products", {
        handler: admin_controller_1.default.handleGetAllProducts,
    });
    fastify.delete("/product/:id", {
        handler: admin_controller_1.default.handleDeleteProduct,
        schema: Object.assign({}, schema_1.requiredIdParam),
    });
});
exports.default = adminRoute;

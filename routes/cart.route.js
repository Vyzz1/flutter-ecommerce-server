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
const auth_1 = __importDefault(require("../utils/auth"));
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const schema_1 = require("../schema");
const cartRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    auth_1.default.authRequiredHook(fastify);
    fastify.post("/", {
        handler: cart_controller_1.default.handleCreate,
        schema: {
            body: {
                type: "object",
                required: ["quantity", "variantId"],
                properties: {
                    variantId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                    quantity: { type: "number", minimum: 1 },
                },
            },
        },
    });
    fastify.delete("/:id", {
        handler: cart_controller_1.default.handleDelete,
        schema: Object.assign({}, schema_1.requiredIdParam),
    });
    fastify.get("/", {
        handler: cart_controller_1.default.handleGetByUser,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.shoppingCartSchema)),
    });
    fastify.put("/:id", {
        handler: cart_controller_1.default.handleUpdateQuantity,
        schema: Object.assign(Object.assign(Object.assign({}, schema_1.requiredIdParam), { body: {
                type: "object",
                required: ["quantity"],
                properties: {
                    quantity: { type: "number", minimum: 1 },
                },
            } }), (0, schema_1.commonResponseSchema)(schema_1.shoppingCartSchema)),
    });
    fastify.get("/anonymous", {
        handler: cart_controller_1.default.handleGetForAnonymous,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.shoppingCartSchema)),
    });
});
exports.default = cartRoute;

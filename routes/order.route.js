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
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_1 = __importDefault(require("../utils/auth"));
const schema_1 = require("../schema");
const orderRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.post("/", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: order_controller_1.default.handleCreateOrder }));
    fastify.get("/", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: order_controller_1.default.handleGetAllOrders }));
    fastify.delete("/:id", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: order_controller_1.default.handleDeleteOrder, schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), { body: {
                type: ["object", "null"],
            } }) }));
    fastify.patch("/:id/status", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: order_controller_1.default.handleChangeOrderStatus }));
    fastify.get("/user", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: order_controller_1.default.handleGetOrderForUser }));
    fastify.get("/count", Object.assign(Object.assign({}, auth_1.default.requiredAuth(fastify)), { handler: order_controller_1.default.handleCountOrderForUser, schema: {
            response: {
                "200": {
                    type: "object",
                    properties: {
                        pending: { type: "number" },
                        processing: { type: "number" },
                        shipping: { type: "number" },
                        delivered: { type: "number" },
                        cancelled: { type: "number" },
                    },
                },
            },
        } }));
});
exports.default = orderRoute;

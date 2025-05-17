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
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const schema_1 = require("../schema");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const anonymousRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.post("/cart", {
        handler: cart_controller_1.default.handleGetForAnonymous,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.shoppingCartSchema)),
    });
    fastify.post("/order", {
        handler: order_controller_1.default.handleCreateOrderForAnonymous,
        schema: {
            body: {
                type: "object",
                required: ["email", "shippingFee", "address", "details", "totalAmount"],
            },
        },
    });
});
exports.default = anonymousRoute;

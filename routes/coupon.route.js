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
const coupon_controller_1 = __importDefault(require("../controllers/coupon.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const couponRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get("/", {
        handler: coupon_controller_1.default.handleGetAll,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.copounSchema)),
    });
    fastify.get("/order", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: coupon_controller_1.default.handleGetCouponByCode, schema: {
            querystring: {
                type: "object",
                properties: {
                    code: { type: "string" },
                },
                required: ["code"],
            },
        } }));
    fastify.get("/:id", {
        handler: coupon_controller_1.default.handleGetById,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.commonResponseSchema)(schema_1.copounSchema)),
    });
    fastify.post("/", Object.assign(Object.assign({ handler: coupon_controller_1.default.handleCreate }, auth_1.default.requiredRole(fastify, "admin")), { schema: Object.assign({ body: {
                type: "object",
                properties: schema_1.copounSchema,
                required: ["code", "discount", "limit"],
            } }, (0, schema_1.commonResponseSchema)(schema_1.copounSchema, 201)) }));
    fastify.patch("/:id", Object.assign(Object.assign({ handler: coupon_controller_1.default.handleUpdate }, auth_1.default.requiredRole(fastify, "admin")), { schema: Object.assign(Object.assign(Object.assign({}, schema_1.requiredIdParam), { body: {
                type: "object",
                properties: schema_1.copounSchema,
            } }), (0, schema_1.commonResponseSchema)(schema_1.copounSchema)) }));
    fastify.delete("/:id", Object.assign(Object.assign({ handler: coupon_controller_1.default.handleDelete }, auth_1.default.requiredRole(fastify, "admin")), { schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.commonResponseSchema)({ message: { type: "string" } })) }));
    fastify.get("/available", {
        handler: coupon_controller_1.default.handleGetAvailableCoupons,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.copounSchema)),
    });
});
exports.default = couponRoute;

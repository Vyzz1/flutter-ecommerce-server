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
const brand_controller_1 = __importDefault(require("../controllers/brand.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const brandRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get("/", {
        handler: brand_controller_1.default.handleGetBrands,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.brandSchema)),
    });
    fastify.post("/", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: brand_controller_1.default.handleCreateBrand, schema: Object.assign({ body: {
                type: "object",
                properties: {
                    name: { type: "string" },
                },
                required: ["name"],
            } }, (0, schema_1.commonResponseSchema)(schema_1.brandSchema, 201)) }));
    fastify.delete("/:id", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: brand_controller_1.default.handleDeleteBrand, schema: Object.assign({}, schema_1.requiredIdParam) }));
    fastify.put("/:id", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: brand_controller_1.default.handleUpdateBrand, schema: Object.assign(Object.assign(Object.assign({}, schema_1.requiredIdParam), { body: {
                type: "object",
                properties: {
                    name: { type: "string" },
                },
                required: ["name"],
            } }), (0, schema_1.commonResponseSchema)(schema_1.brandSchema)) }));
});
exports.default = brandRoute;

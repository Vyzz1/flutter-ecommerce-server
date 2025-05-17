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
const product_attribute_controller_1 = __importDefault(require("../controllers/product-attribute.controller"));
const schema_1 = require("../schema");
const attributeRoute = (fastify, opts) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get("/", {
        handler: product_attribute_controller_1.default.handleGetAll,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.attributeSchema)),
    });
    fastify.post("/", {
        // ...auth.requiredRole(fastify, "admin"),
        handler: product_attribute_controller_1.default.handleCreate,
        schema: Object.assign(Object.assign({}, (0, schema_1.commonResponseSchema)(schema_1.attributeSchema, 201)), { body: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                },
            } }),
    });
    fastify.put("/:id", {
        handler: product_attribute_controller_1.default.handleEdit,
        schema: Object.assign(Object.assign(Object.assign({}, (0, schema_1.commonResponseSchema)(schema_1.attributeSchema)), schema_1.requiredIdParam), { body: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                },
            } }),
    });
});
exports.default = attributeRoute;

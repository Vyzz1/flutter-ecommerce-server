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
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const auth_1 = __importDefault(require("../utils/auth"));
const productRoute = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.post("/", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: product_controller_1.default.handleCreateProduct, schema: {
            body: {
                type: "object",
                required: [
                    "name",
                    "description",
                    "categoryId",
                    "variants",
                    "attributes",
                    "images",
                ],
                properties: {
                    attributes: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
            },
        } }));
    fastify.get("/:id", product_controller_1.default.handleGetProductDetails);
    fastify.patch("/:id", Object.assign(Object.assign({}, auth_1.default.requiredRole(fastify, "admin")), { handler: product_controller_1.default.handleUpdateProduct }));
    fastify.get("/filters", product_controller_1.default.handleFilterProducts);
    fastify.get("/home", product_controller_1.default.handleGetHomeProducts);
});
exports.default = productRoute;

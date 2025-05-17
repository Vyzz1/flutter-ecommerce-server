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
const address_controller_1 = __importDefault(require("../controllers/address.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const addressRouter = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    auth_1.default.authRequiredHook(fastify);
    fastify.get("/", {
        handler: address_controller_1.default.handleGetAddress,
        schema: Object.assign({}, (0, schema_1.arrayResponseSchema)(schema_1.addressSchema)),
    });
    fastify.post("/", {
        handler: address_controller_1.default.handleCreateAddress,
        schema: Object.assign({ body: {
                type: "object",
                required: ["fullName", "fullAddress", "phoneNumber"],
                properties: {
                    fullName: { type: "string" },
                    fullAddress: { type: "string" },
                    phoneNumber: { type: "string" },
                },
            } }, (0, schema_1.commonResponseSchema)(schema_1.addressSchema, 201)),
    });
    fastify.patch("/:id", {
        handler: address_controller_1.default.handleUpdateAddress,
        schema: Object.assign(Object.assign(Object.assign({}, (0, schema_1.commonResponseSchema)(schema_1.addressSchema)), schema_1.requiredIdParam), { body: {
                type: "object",
                properties: {
                    fullName: { type: "string" },
                    fullAddress: {
                        type: "string",
                    },
                    phoneNumber: { type: "string" },
                },
                required: ["fullName", "fullAddress", "phoneNumber"],
            } }),
    });
    fastify.delete("/:id", {
        handler: address_controller_1.default.handleDeleteAddress,
        schema: Object.assign({}, schema_1.requiredIdParam),
    });
    fastify.put("/default", {
        handler: address_controller_1.default.handleSetDefaultAddress,
        schema: Object.assign({ body: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" },
                },
            } }, (0, schema_1.commonResponseSchema)(schema_1.addressSchema)),
    });
    fastify.get("/test", address_controller_1.default.handleTest);
});
exports.default = addressRouter;

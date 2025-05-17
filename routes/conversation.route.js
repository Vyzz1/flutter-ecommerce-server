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
const conversation_controller_1 = __importDefault(require("../controllers/conversation.controller"));
const auth_1 = __importDefault(require("../utils/auth"));
const schema_1 = require("../schema");
const conversationRoute = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    auth_1.default.authRequiredHook(fastify);
    fastify.post("/", conversation_controller_1.default.handleCreateConservation);
    fastify.get("/me", conversation_controller_1.default.handleGetUserConversation);
    fastify.delete("/:id", Object.assign(Object.assign({ handler: conversation_controller_1.default.handleDeleteConversation }, auth_1.default.requiredRole(fastify, "admin")), { schema: Object.assign({}, schema_1.requiredIdParam) }));
});
exports.default = conversationRoute;

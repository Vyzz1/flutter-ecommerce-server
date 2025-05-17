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
const validateJwt_1 = __importDefault(require("../hooks/validateJwt"));
const validateRole_1 = __importDefault(require("../hooks/validateRole"));
const requiredRole = (fastify, ...role) => ({
    onRequest: fastify.auth([validateJwt_1.default, (0, validateRole_1.default)(...role)], {
        relation: "and",
    }),
});
const requiredAuth = (fastify) => ({
    onRequest: fastify.auth([validateJwt_1.default], { relation: "and" }),
});
const authRequiredHook = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.addHook("onRequest", fastify.auth([validateJwt_1.default]));
});
const roleRequiredHook = (fastify, ...roleName) => {
    fastify.addHook("onRequest", fastify.auth([validateJwt_1.default, (0, validateRole_1.default)(...roleName)], {
        relation: "and",
    }));
};
exports.default = {
    requiredRole,
    requiredAuth,
    authRequiredHook,
    roleRequiredHook,
};

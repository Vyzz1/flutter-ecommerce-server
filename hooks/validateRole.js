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
Object.defineProperty(exports, "__esModule", { value: true });
const validateRole = function (...requiredRole) {
    return function (request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRole = request.user.role;
            if (!userRole || !requiredRole.includes(userRole)) {
                reply.code(403).send({ message: "Forbidden" });
            }
        });
    };
};
exports.default = validateRole;

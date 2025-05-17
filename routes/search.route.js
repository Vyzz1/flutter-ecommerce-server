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
const elasticSearch_service_1 = __importDefault(require("../services/elasticSearch.service"));
const searchRouter = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        return elasticSearch_service_1.default.searchContent();
    }));
    fastify.get("/autocomplete", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { searchText } = request.query;
        const result = yield elasticSearch_service_1.default.searchAutoComplete(searchText);
        return result;
    }));
});
exports.default = searchRouter;

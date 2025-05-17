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
const ErrorResponse_1 = require("../errors/ErrorResponse");
const coupon_service_1 = __importDefault(require("../services/coupon.service"));
const handleCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const copoun = yield coupon_service_1.default.createCoupon(req.body);
        return res.status(201).send(copoun);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const copoun = yield coupon_service_1.default.editCoupon(req.params.id, req.body);
        return res.status(200).send(copoun);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const copouns = yield coupon_service_1.default.getCoupons();
        return res.status(200).send(copouns);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const copoun = yield coupon_service_1.default.findCouponById(req.params.id);
        return res.status(200).send(copoun);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield coupon_service_1.default.findCouponByCategory(req.params.category);
        return res.status(200).send(coupons);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield coupon_service_1.default.deleteCoupon(req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetAvailableCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield coupon_service_1.default.findAvailableCoupons();
        return res.status(200).send(coupons);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
const handleGetCouponByCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    try {
        const coupon = yield coupon_service_1.default.findOrderByCode(code);
        return res.status(200).send(coupon);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendErrorWithDetails(res, error);
    }
});
exports.default = {
    handleCreate,
    handleUpdate,
    handleGetAll,
    handleGetById,
    handleGetByCategory,
    handleDelete,
    handleGetAvailableCoupons,
    handleGetCouponByCode,
};

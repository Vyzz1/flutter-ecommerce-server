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
const AgrumentError_1 = __importDefault(require("../errors/AgrumentError"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
class CouponService {
    constructor() { }
    createCoupon(copoun) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findExist = yield coupon_model_1.default.findOne({ code: copoun.code }).exec();
                if (findExist) {
                    throw new AgrumentError_1.default("Coupon already exists", 409);
                }
                const newCoupon = yield coupon_model_1.default.create({
                    code: copoun.code,
                    discount: copoun.discount,
                    count: copoun.count,
                    limit: copoun.limit,
                });
                return newCoupon;
            }
            catch (error) {
                throw error;
            }
        });
    }
    editCoupon(id, coupon) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findExist = yield coupon_model_1.default.findById(id).exec();
                if (!findExist) {
                    throw new AgrumentError_1.default("Coupon Not Found", 404);
                }
                const findDuplicate = yield coupon_model_1.default.findOne({
                    code: coupon.code,
                    _id: { $ne: id },
                }).exec();
                if (findDuplicate) {
                    throw new AgrumentError_1.default("Coupon already exists", 409);
                }
                findExist.code = coupon.code;
                findExist.discount = coupon.discount;
                findExist.limit = coupon.limit;
                yield findExist.save();
                return findExist;
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteCoupon(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupon = yield coupon_model_1.default.findByIdAndDelete(id).exec();
                if (!coupon) {
                    throw new AgrumentError_1.default("Coupon Not Found", 404);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getCoupons() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupons = yield coupon_model_1.default.find().sort({ createdAt: -1 }).exec();
                return coupons;
            }
            catch (error) {
                throw new Error("Error fetching coupons");
            }
        });
    }
    findCouponById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupon = yield coupon_model_1.default.findById(id).exec();
                if (!coupon) {
                    throw new AgrumentError_1.default("Coupon Not Found", 404);
                }
                return coupon;
            }
            catch (error) {
                throw new Error("Error fetching coupon");
            }
        });
    }
    findCouponByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (category.length === 0) {
                    return [];
                }
                const coupons = yield coupon_model_1.default.find({
                    categories: { $in: [category] },
                })
                    .sort({ createdAt: -1 })
                    .exec();
                return coupons;
            }
            catch (error) {
                throw new Error("Error fetching coupons");
            }
        });
    }
    findAvailableCoupons() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupons = yield coupon_model_1.default.find({ limit: { $gt: 0 } }).exec();
                return coupons;
            }
            catch (error) {
                throw new Error("Error fetching available coupons");
            }
        });
    }
    findOrderByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield order_model_1.default.find({ discountCode: code })
                    .populate({
                    path: "details",
                    select: "-__v",
                })
                    .populate({
                    path: "statuses",
                    select: "_id status createdAt",
                })
                    .lean()
                    .exec();
                return order || [];
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new CouponService();

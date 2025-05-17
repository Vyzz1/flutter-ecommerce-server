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
const productVariants_model_1 = __importDefault(require("../models/productVariants.model"));
const rating_model_1 = __importDefault(require("../models/rating.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const orderDetails_model_1 = __importDefault(require("../models/orderDetails.model"));
const product_service_1 = __importDefault(require("./product.service"));
const gemini_service_1 = __importDefault(require("./gemini.service"));
class RatingService {
    getAllRating(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ratings = yield rating_model_1.default.find({ product: productId })
                    .populate("user", "fullName  avatar")
                    .populate({
                    path: "variant",
                    select: "attributes",
                    populate: [
                        {
                            path: "attributes",
                            select: "name value",
                        },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .lean()
                    .exec();
                return ratings.map((rating) => {
                    const formattedRating = Object.assign({}, rating);
                    if (formattedRating.variant && formattedRating.variant.attributes) {
                        formattedRating.variant.attributesString =
                            formattedRating.variant.attributes
                                .map((attr) => attr.value)
                                .join("-");
                    }
                    return formattedRating;
                });
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    createRating(rating, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findOne({ email: userEmail }).exec();
                if (!user) {
                    throw new AgrumentError_1.default("User not found", 404);
                }
                const variant = yield productVariants_model_1.default.findById(rating.variantId).exec();
                if (!variant) {
                    throw new AgrumentError_1.default("Variant not found", 404);
                }
                const label = yield gemini_service_1.default.labelContent(rating.review);
                const newRating = yield rating_model_1.default.create(Object.assign(Object.assign({}, rating), { label, product: variant === null || variant === void 0 ? void 0 : variant.product, variant: variant === null || variant === void 0 ? void 0 : variant._id, user: user._id }));
                const orderDetails = yield orderDetails_model_1.default.findById(rating.orderDetailsId).exec();
                if (!orderDetails) {
                    throw new AgrumentError_1.default("Order details not found", 404);
                }
                orderDetails.isRated = true;
                yield orderDetails.save();
                const populated = yield rating_model_1.default.find({ _id: newRating._id })
                    .populate("user", "fullName avatar")
                    .populate({
                    path: "variant",
                    select: "attributes",
                    populate: [
                        {
                            path: "attributes",
                            select: "name value",
                        },
                    ],
                })
                    .lean()
                    .exec();
                const result = populated.map((rating) => {
                    const formattedRating = Object.assign({}, rating);
                    if (formattedRating.variant && formattedRating.variant.attributes) {
                        formattedRating.variant.attributesString =
                            formattedRating.variant.attributes
                                .map((attr) => attr.value)
                                .join("-");
                    }
                    return formattedRating;
                });
                product_service_1.default.updateProductRating(newRating.product, newRating.rating);
                return result[0];
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    getTwoFirstRating(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield rating_model_1.default.find({ product: productId })
                    .populate({
                    path: "user",
                    select: "fullName avatar",
                })
                    .populate({
                    path: "variant",
                    select: "attributes",
                    populate: [
                        {
                            path: "attributes",
                            select: "name value",
                        },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .limit(2)
                    .lean()
                    .exec();
                return results.map((rating) => {
                    const formattedRating = Object.assign({}, rating);
                    if (formattedRating.variant && formattedRating.variant.attributes) {
                        formattedRating.variant.attributesString =
                            formattedRating.variant.attributes
                                .map((attr) => attr.value)
                                .join("-");
                    }
                    return formattedRating;
                });
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
}
exports.default = new RatingService();

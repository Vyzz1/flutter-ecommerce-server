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
const productVariants_model_1 = __importDefault(require("../models/productVariants.model"));
const shopping_cart_model_1 = __importDefault(require("../models/shopping-cart.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AgrumentError_1 = __importDefault(require("../errors/AgrumentError"));
class ShoppingCartService {
    constructor() { }
    createShoppingCart(user, shoppingCart) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const foundUser = yield user_model_1.default.findById(user).exec();
                if (!foundUser) {
                    throw new AgrumentError_1.default("User not found", 404);
                }
                const variant = yield productVariants_model_1.default.findById(shoppingCart.variantId).exec();
                if (!variant) {
                    throw new AgrumentError_1.default("Product not found", 404);
                }
                const oldShoppingCart = yield shopping_cart_model_1.default.findOne({
                    user: user,
                    variant: shoppingCart.variantId,
                }).exec();
                if (oldShoppingCart != null &&
                    oldShoppingCart.quantity + shoppingCart.quantity > variant.stock) {
                    throw new AgrumentError_1.default("Not enough stock available", 400);
                }
                if (oldShoppingCart) {
                    oldShoppingCart.quantity += shoppingCart.quantity;
                    const cart = yield oldShoppingCart.save();
                    return cart;
                }
                else {
                    if (shoppingCart.quantity > variant.stock) {
                        throw new AgrumentError_1.default("Not enough stock available", 400);
                    }
                    const newShoppingCart = yield shopping_cart_model_1.default.create({
                        user: user,
                        variant: shoppingCart.variantId,
                        quantity: shoppingCart.quantity,
                    });
                    return newShoppingCart;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getShoppingCartForAnonymousUser(shoppingCart) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const variants = yield productVariants_model_1.default.find({
                    _id: { $in: shoppingCart.map((item) => item.variantId) },
                })
                    .populate({
                    path: "product",
                    select: "name category images",
                    populate: {
                        path: "category",
                        select: "name image",
                    },
                })
                    .populate({
                    path: "attributes.attribute",
                    select: "name",
                })
                    .select("price stock attributes images discount product")
                    .exec();
                const cart = shoppingCart
                    .map((item) => {
                    const variant = variants.find((v) => v._id.toString() === item.variantId);
                    if (!variant || item.quantity > variant.stock) {
                        return null;
                    }
                    return {
                        _id: item.id,
                        variant: variant,
                        quantity: item.quantity,
                        user: "anonymous",
                    };
                })
                    .filter((item) => item !== null);
                return cart;
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteShoppingCart(shoppingCartId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cart = yield shopping_cart_model_1.default.findByIdAndDelete(shoppingCartId).exec();
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    getShoppingCart(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cart = yield shopping_cart_model_1.default.find({ user: user })
                    .populate({
                    path: "variant",
                    select: "price stock attributes  images discount product",
                    populate: [
                        {
                            path: "product",
                            select: "name category images",
                            populate: {
                                path: "category",
                                select: "name image",
                            },
                        },
                        {
                            path: "attributes.attribute",
                            select: "name",
                        },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .exec();
                return cart;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    updateShoppingCart(shoppingCartId, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cartItem = yield shopping_cart_model_1.default.findById(shoppingCartId)
                    .populate("variant", "stock")
                    .exec();
                if (!cartItem) {
                    return Promise.reject("Shopping cart item not found");
                }
                if (newQuantity > cartItem.variant.stock) {
                    return Promise.reject("Not enough stock available");
                }
                cartItem.quantity = newQuantity;
                const updatedCart = yield cartItem.save();
                return updatedCart;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.default = new ShoppingCartService();

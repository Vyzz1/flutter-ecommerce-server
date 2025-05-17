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
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class AdminService {
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_model_1.default.findByIdAndDelete(id);
            if (!product) {
                throw new AgrumentError_1.default("Product not found", 404);
            }
            return product;
        });
    }
    getAllUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.find({
                    role: { $ne: "admin" },
                })
                    .select("-password -__v -role")
                    .sort({ createdAt: -1 });
                return user;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getDashboardData(timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!timestamp) {
                    //set default timestamp to annualy
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 1);
                    timestamp = date;
                }
                //total Revenue
                //total profit
                //total orders
                //total users
                //total products
                const totalUsers = yield user_model_1.default.countDocuments({
                    role: { $ne: "admin" },
                    createdAt: { $gte: timestamp },
                }).exec();
                const totalProducts = yield product_model_1.default.countDocuments({
                    createdAt: { $gte: timestamp },
                }).exec();
                const totalOrder = yield order_model_1.default.countDocuments({
                    createdAt: { $gte: timestamp },
                });
                // const report = await Reports.find
            }
            catch (error) {
                console.error("Error fetching dashboard data:", error);
                throw error;
            }
        });
    }
    banUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findByIdAndUpdate(userId, { isBanned: true }, { new: true }).select("-password -__v -role -refreshToken");
                if (!user) {
                    throw new AgrumentError_1.default("User not found", 404);
                }
                return user;
            }
            catch (error) {
                console.error("Error banning user:", error);
                throw error;
            }
        });
    }
    updateUser(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findByIdAndUpdate(userId, data, { new: true });
                if (!user) {
                    throw new Error("User not found");
                }
                return user;
            }
            catch (error) {
                console.error("Error updating user:", error);
                throw error;
            }
        });
    }
    unBanUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findByIdAndUpdate(userId, { isBanned: false }, { new: true });
                if (!user) {
                    throw new Error("User not found");
                }
                return user;
            }
            catch (error) {
                console.error("Error unbanning user:", error);
                throw error;
            }
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findByIdAndDelete(userId);
                if (!user) {
                    throw new Error("User not found");
                }
                return user;
            }
            catch (error) {
                console.error("Error deleting user:", error);
                throw error;
            }
        });
    }
    getAllProducts(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 0, limit = 5, sortBy = "updatedAt", sortType = "desc", brands = [], minPrice, maxPrice, categories = [], rating, keyword, } = request;
                const query = {};
                if (keyword) {
                    query.$or = [
                        { name: { $regex: keyword, $options: "i" } },
                        { description: { $regex: keyword, $options: "i" } },
                    ];
                }
                if (minPrice !== undefined || maxPrice !== undefined) {
                    query.minPrice = {};
                    if (minPrice !== undefined) {
                        query.minPrice.$gte = minPrice;
                    }
                    if (maxPrice !== undefined) {
                        query.minPrice.$lte = maxPrice;
                    }
                }
                if (brands.length > 0) {
                    query.brand = { $in: brands };
                }
                if (categories.length > 0) {
                    query.category = { $in: categories };
                }
                if (rating) {
                    switch (rating) {
                        case "BELOW_3":
                            query.avgRating = { $lt: 3 };
                            break;
                        case "3_TO_4":
                            query.avgRating = { $gte: 3, $lt: 4 };
                            break;
                        case "4_TO_5":
                            query.avgRating = { $gte: 4, $lte: 5 };
                            break;
                    }
                }
                const skip = page * limit;
                const sort = {};
                if (!sortBy) {
                    sort["updatedAt"] = -1;
                }
                sort[sortBy] = sortType === "asc" ? 1 : -1;
                const total = yield product_model_1.default.countDocuments(query);
                console.log(sort);
                const products = yield product_model_1.default.find(query)
                    .populate("category", "name image")
                    .populate("brand", "name _id")
                    .populate("attributes", "name _id")
                    .populate({
                    path: "variants",
                    select: "price stock attributes basePrice images discount _id",
                    populate: {
                        path: "attributes.attribute",
                        select: "name",
                    },
                })
                    .select("-__v")
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalPages = Math.ceil(total / limit);
                const isNext = page < totalPages;
                const isLast = page === totalPages;
                const isFirst = page === 0;
                return {
                    data: products,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages,
                        isNext,
                        isLast,
                        isFirst,
                    },
                };
            }
            catch (error) {
                console.error("Failed to get products:", error);
                throw error;
            }
        });
    }
}
exports.default = new AdminService();

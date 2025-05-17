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
const orderDetails_model_1 = __importDefault(require("../models/orderDetails.model"));
const orderStatus_model_1 = __importDefault(require("../models/orderStatus.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const productVariants_model_1 = __importDefault(require("../models/productVariants.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mailer_1 = __importDefault(require("../utils/mailer"));
const product_service_1 = __importDefault(require("./product.service"));
const report_service_1 = __importDefault(require("./report.service"));
class OrderService {
    constructor() { }
    createOrderForUser(email, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findOne({ email: email }).exec();
            if (!user) {
                throw new Error("User not found");
            }
            const { loyaltyPoint, discountCode, shippingFee, address, details, totalAmount, } = request;
            const isUseLoyaltyPoint = loyaltyPoint > 0;
            if (isUseLoyaltyPoint && loyaltyPoint > user.loyaltyPoint) {
                throw new AgrumentError_1.default("Not enough loyalty point");
            }
            let findDiscount;
            const isUseDiscountCode = discountCode !== "No" && discountCode.match("^[a-zA-Z0-9]{5}$") !== null;
            if (isUseDiscountCode) {
                findDiscount = yield coupon_model_1.default.findOne({ code: discountCode }).exec();
                if (!findDiscount) {
                    throw new AgrumentError_1.default("Discount code not found");
                }
                if (findDiscount.limit === 0) {
                    throw new AgrumentError_1.default("Discount code limit reached");
                }
            }
            const newOrder = new order_model_1.default(Object.assign({ user: user._id, details: details, totalAmount: totalAmount, address: address.fullAddress, fullName: address.fullName, phoneNumber: address.phoneNumber, loyaltyPoint: loyaltyPoint, shippingFee: shippingFee, currentStatus: "Pending", email: email }, (isUseDiscountCode && { discountCode: discountCode })));
            const orderDetailsList = [];
            for (const detail of details) {
                const findVariant = yield productVariants_model_1.default.findById(detail.variantId).exec();
                let image = "";
                if (!findVariant) {
                    throw new AgrumentError_1.default("Variant not found");
                }
                if (findVariant.images.length > 0) {
                    image = findVariant.images[0];
                }
                else {
                    const product = yield product_model_1.default.findById(findVariant.product).exec();
                    if (!product) {
                        throw new AgrumentError_1.default("Product not found");
                    }
                    image = product.images[0];
                }
                if (findVariant.stock < detail.quantity) {
                    throw new AgrumentError_1.default("Not enough stock");
                }
                const orderDetails = yield orderDetails_model_1.default.create({
                    variantId: detail.variantId,
                    quantity: detail.quantity,
                    productName: detail.productName,
                    price: findVariant.price,
                    basePrice: findVariant.basePrice,
                    image: image,
                    productId: findVariant.product,
                    discount: findVariant.discount,
                    attributes: detail.attributes,
                });
                findVariant.quantity -= detail.quantity;
                orderDetailsList.push(orderDetails);
            }
            newOrder.details = orderDetailsList.map((v) => v._id);
            const status = yield orderStatus_model_1.default.create({});
            newOrder.statuses.push(status._id);
            yield newOrder.save();
            if (isUseLoyaltyPoint) {
                user.loyaltyPoint -= loyaltyPoint;
                yield user.save();
            }
            if (isUseDiscountCode) {
                findDiscount.count += 1;
                findDiscount.limit -= 1;
                findDiscount.order.push(newOrder._id);
                yield findDiscount.save();
            }
            mailer_1.default.sendOrderConfirmationEmail(newOrder._id, email);
            return newOrder;
        });
    }
    createOrderForAnonymousUser(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const foundUser = yield user_model_1.default.findOne({
                    email: request.email,
                }).exec();
                if (foundUser && !foundUser.isCreateFromAnonymousOrder) {
                    throw new AgrumentError_1.default("This email is already used");
                }
                let userId = undefined;
                if (!foundUser) {
                    const newUser = yield user_model_1.default.create({
                        email: request.email,
                        role: "customer",
                        loyaltyPoint: 0,
                        isCreateFromAnonymousOrder: true,
                    });
                    userId = newUser._id.toString();
                }
                else {
                    userId = foundUser._id.toString();
                }
                const { discountCode, shippingFee, address, details, totalAmount } = request;
                let findDiscount;
                const isUseDiscountCode = discountCode !== "No" &&
                    discountCode.match("^[a-zA-Z0-9]{5}$") !== null;
                if (isUseDiscountCode) {
                    findDiscount = yield coupon_model_1.default.findOne({ code: discountCode }).exec();
                    if (!findDiscount) {
                        throw new AgrumentError_1.default("Discount code not found");
                    }
                    if (findDiscount.limit === 0) {
                        throw new AgrumentError_1.default("Discount code limit reached");
                    }
                }
                const newOrder = new order_model_1.default(Object.assign({ user: userId, details: details, totalAmount: totalAmount, address: address.fullAddress, fullName: address.fullName, phoneNumber: address.phoneNumber, shippingFee: shippingFee, currentStatus: "Pending", email: request.email }, (isUseDiscountCode && { discountCode: discountCode })));
                const orderDetailsList = [];
                for (const detail of details) {
                    const findVariant = yield productVariants_model_1.default.findById(detail.variantId).exec();
                    let image = "";
                    if (!findVariant) {
                        throw new AgrumentError_1.default("Variant not found");
                    }
                    if (findVariant.images.length > 0) {
                        image = findVariant.images[0];
                    }
                    else {
                        const product = yield product_model_1.default.findById(findVariant.product).exec();
                        if (!product) {
                            throw new AgrumentError_1.default("Product not found");
                        }
                        image = product.images[0];
                    }
                    if (findVariant.stock < detail.quantity) {
                        throw new AgrumentError_1.default("Not enough stock");
                    }
                    const orderDetails = yield orderDetails_model_1.default.create({
                        variantId: detail.variantId,
                        quantity: detail.quantity,
                        productName: detail.productName,
                        price: findVariant.price,
                        image: image,
                        productId: findVariant.product,
                        discount: findVariant.discount,
                        attributes: detail.attributes,
                        basePrice: findVariant.basePrice,
                    });
                    findVariant.quantity -= detail.quantity;
                    yield findVariant.save();
                    orderDetailsList.push(orderDetails);
                }
                newOrder.details = orderDetailsList.map((v) => v._id);
                const status = yield orderStatus_model_1.default.create({});
                newOrder.statuses.push(status._id);
                yield newOrder.save();
                if (isUseDiscountCode) {
                    findDiscount.count += 1;
                    findDiscount.limit -= 1;
                    findDiscount.order.push(newOrder._id);
                    yield findDiscount.save();
                }
                mailer_1.default.sendOrderConfirmationEmail(newOrder._id, request.email);
                return newOrder;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getAllOrders(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 0, limit = 2, status, fromDate, toDate, search, sortBy, sortType, } = request;
            const query = {};
            if (status && status !== "All") {
                query.currentStatus = status;
            }
            if (fromDate && toDate) {
                query.createdAt = {};
                if (fromDate) {
                    const startDate = new Date(fromDate);
                    startDate.setUTCHours(0, 0, 0, 0);
                    query.createdAt.$gte = startDate;
                    console.log(`fromDate: ${startDate.toISOString()}`);
                }
                if (toDate) {
                    const endDate = new Date(toDate);
                    endDate.setUTCHours(0, 0, 0, 0);
                    endDate.setDate(endDate.getDate() + 1);
                    query.createdAt.$lt = endDate;
                    console.log(`toDate: ${endDate.toISOString()}`);
                }
                console.log(`createdAt Query: ${JSON.stringify(query.createdAt)}`);
            }
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { phoneNumber: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                ];
            }
            const sort = {};
            if (sortBy) {
                sort[sortBy] = sortType === "desc" ? -1 : 1;
            }
            else {
                sort.createdAt = -1;
            }
            try {
                const total = yield order_model_1.default.countDocuments(query);
                const currentPage = page;
                const totalPages = Math.ceil(total / limit);
                const isFirst = currentPage === 0;
                const isLast = currentPage === totalPages - 1 || totalPages === 0;
                const isNext = currentPage < totalPages - 1;
                const orders = yield order_model_1.default.find(query)
                    .populate({
                    path: "details",
                    select: "-__v",
                })
                    .populate({
                    path: "statuses",
                    select: "_id status createdAt",
                })
                    .sort(sort)
                    .skip(page * limit)
                    .limit(limit)
                    .lean();
                return {
                    data: orders,
                    pagination: {
                        total,
                        page: currentPage,
                        limit,
                        totalPages,
                        isFirst,
                        isLast,
                        isNext,
                    },
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getOrderById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield order_model_1.default.findById(id)
                    .populate({
                    path: "details",
                    select: "-__v",
                })
                    .populate({
                    path: "statuses",
                    select: "_id status createdAt",
                })
                    .lean();
                return order;
            }
            catch (error) {
                console.error("Failed to get order by ID:", error);
                throw error;
            }
        });
    }
    updateOrderStatus(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedOrder = yield order_model_1.default.findById(orderId)
                    .populate({
                    path: "details",
                    select: "_id productName quantity price discount image productId variantId",
                })
                    .populate({
                    path: "statuses",
                    select: "_id status createdAt",
                });
                if (!updatedOrder) {
                    throw new AgrumentError_1.default("Order not found");
                }
                const statusOrder = {
                    Pending: 0,
                    Processing: 1,
                    Shipped: 2,
                    Delivered: 3,
                    Cancelled: 4,
                };
                if (!(status in statusOrder)) {
                    throw new AgrumentError_1.default("Invalid status");
                }
                const currentStatusIndex = statusOrder[updatedOrder.currentStatus];
                const newStatusIndex = statusOrder[status];
                if (newStatusIndex !== statusOrder.Cancelled) {
                    if (newStatusIndex <= currentStatusIndex) {
                        throw new AgrumentError_1.default(`Cannot change from ${updatedOrder.currentStatus} to ${status}`);
                    }
                }
                else {
                    if (currentStatusIndex >= statusOrder.Delivered) {
                        throw new AgrumentError_1.default(`Cannot cancel order from ${updatedOrder.currentStatus}`);
                    }
                }
                const newStatus = yield orderStatus_model_1.default.create({
                    status,
                });
                if (status === "Delivered") {
                    const loyaltyPoint = Math.floor(updatedOrder.totalAmount / 10000);
                    const user = yield user_model_1.default.findOne({ email: updatedOrder.email }).exec();
                    updatedOrder.details.forEach((orderDetail) => {
                        product_service_1.default.updateSoldCount(orderDetail.productId, orderDetail.quantity);
                    });
                    report_service_1.default.updateReport(updatedOrder);
                    if (user) {
                        user.loyaltyPoint += loyaltyPoint;
                        yield user.save();
                    }
                }
                updatedOrder.set("currentStatus", status);
                updatedOrder.statuses.push(newStatus);
                yield updatedOrder.save();
                return updatedOrder;
            }
            catch (error) {
                console.error("Failed to update order status:", error);
                throw error;
            }
        });
    }
    deleteOrder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield order_model_1.default.findByIdAndDelete(id);
                if (!order) {
                    throw new AgrumentError_1.default("Order not found");
                }
                return order;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getOrderForUser(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { user: userId };
                if (status !== "All") {
                    query.currentStatus = status;
                }
                const order = yield order_model_1.default.find(query)
                    .populate({
                    path: "details",
                    select: "-__v ",
                })
                    .populate({
                    path: "statuses",
                    select: "_id status createdAt",
                })
                    .sort({ createdAt: -1 })
                    .lean();
                return order || [];
            }
            catch (error) {
                throw error;
            }
        });
    }
    getCountOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [pending, processing, shipping, delivered, cancelled] = yield Promise.all([
                    order_model_1.default.countDocuments({
                        user: userId,
                        currentStatus: "Pending",
                    }).exec(),
                    order_model_1.default.countDocuments({
                        user: userId,
                        currentStatus: "Processing",
                    }).exec(),
                    order_model_1.default.countDocuments({
                        user: userId,
                        currentStatus: "Shipped",
                    }).exec(),
                    order_model_1.default.countDocuments({
                        user: userId,
                        currentStatus: "Delivered",
                    }).exec(),
                    order_model_1.default.countDocuments({
                        user: userId,
                        currentStatus: "Cancelled",
                    }).exec(),
                ]);
                return {
                    pending,
                    processing,
                    shipping,
                    delivered,
                    cancelled,
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new OrderService();

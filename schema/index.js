"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandSchema = exports.ratingRequestSchema = exports.ratingSchema = exports.copounSchema = exports.orderSchema = exports.orderDetailSchema = exports.productItemSchema = exports.smallProductSchema = exports.addressSchema = exports.requiredIdParam = exports.arrayResponseSchema = exports.commonResponseSchema = exports.errorResponse = exports.shoppingCartSchema = exports.productVariantSchema = exports.variantAttribute = exports.attributeSchema = exports.categorySchema = exports.userSchema = exports.errorResponseSchema = void 0;
exports.errorResponseSchema = {
    message: { type: "string" },
    status: { type: "number" },
    timestamp: { type: "string" },
};
exports.userSchema = {
    _id: { type: "string" },
    email: { type: "string" },
    fullName: { type: "string" },
    role: { type: "string" },
    avatar: { type: "string" },
    dateOfBirth: { type: "string" },
    gender: { type: "string" },
    loyaltyPoint: { type: "number" },
    isBanned: { type: "boolean" },
    isCreateFromAnonymousOrder: { type: "boolean" },
    phoneNumber: { type: "string" },
};
exports.categorySchema = {
    _id: { type: "string" },
    name: { type: "string" },
    image: { type: "string" },
};
exports.attributeSchema = {
    _id: { type: "string" },
    name: { type: "string" },
};
exports.variantAttribute = {
    _id: { type: "string" },
    value: { type: "string" },
    attributeId: { type: "string" },
    attribute: {
        type: "object",
        properties: exports.attributeSchema,
    },
};
exports.productVariantSchema = {
    _id: { type: "string" },
    value: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    price: { type: "number" },
    discount: { type: "number" },
    stock: { type: "number" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    product: {
        type: "object",
        properties: {
            _id: { type: "string" },
            name: { type: "string" },
            images: { type: "array", items: { type: "string" } },
            category: {
                type: "object",
                properties: exports.categorySchema,
            },
        },
    },
    attributes: {
        type: "array",
        items: {
            type: "object",
            properties: exports.variantAttribute,
        },
    },
};
exports.shoppingCartSchema = {
    _id: { type: "string" },
    quantity: { type: "number" },
    variant: {
        type: "object",
        properties: exports.productVariantSchema,
    },
};
exports.errorResponse = {
    "4xx": { $ref: "ErrorResponse#" },
};
const commonResponseSchema = (properties, status = 200, type = "object") => ({
    response: Object.assign({ [status]: {
            type: type,
            properties,
        } }, exports.errorResponse),
});
exports.commonResponseSchema = commonResponseSchema;
const arrayResponseSchema = (properties, status = 200) => ({
    response: Object.assign({ [status]: {
            type: "array",
            items: {
                type: "object",
                properties,
            },
        } }, exports.errorResponse),
});
exports.arrayResponseSchema = arrayResponseSchema;
exports.requiredIdParam = {
    params: {
        type: "object",
        properties: {
            id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
        },
        required: ["id"],
    },
};
exports.addressSchema = {
    _id: { type: "string" },
    fullName: { type: "string" },
    phoneNumber: { type: "string" },
    isDefault: { type: "boolean" },
    fullAddress: { type: "string" },
};
exports.smallProductSchema = {
    _id: { type: "string" },
    name: { type: "string" },
    avatar: { type: "string", format: "uri" },
    price: { type: "number" },
    productColor: {
        type: "object",
        properties: exports.productVariantSchema,
    },
};
exports.productItemSchema = {
    _id: { type: "string" },
    quantity: { type: "number" },
    productSize: {
        type: "object",
        properties: exports.productVariantSchema,
    },
    product: {
        type: "object",
        properties: exports.smallProductSchema,
    },
};
exports.orderDetailSchema = {
    _id: { type: "string" },
    quantity: { type: "number" },
    productItem: {
        type: "object",
        properties: exports.productItemSchema,
    },
};
exports.orderSchema = {
    _id: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    user: { type: "string" },
    status: { type: "string" },
    orderDetails: {
        type: "array",
        items: {
            type: "object",
            properties: exports.orderDetailSchema,
        },
    },
    address: { type: "string" },
    fullName: { type: "string" },
    phoneNumber: { type: "string" },
    specify: { type: "string" },
    total: { type: "number" },
    shippingFee: { type: "number" },
};
exports.copounSchema = {
    _id: { type: "string" },
    code: { type: "string", pattern: "^[a-zA-Z0-9]{5}$" },
    discount: { type: "number" },
    count: { type: "number" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    limit: { type: "number" },
};
exports.ratingSchema = {
    _id: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    rating: { type: "number" },
    review: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    variantId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    product: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    user: {
        type: "object",
        properties: exports.userSchema,
    },
    variant: {
        type: "object",
        properties: {
            _id: { type: "string" },
            attributes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        value: { type: "string" },
                    },
                },
            },
            attributesString: { type: "string" },
        },
    },
};
exports.ratingRequestSchema = {
    _id: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    rating: { type: "number" },
    review: { type: "string" },
    variantId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
};
exports.brandSchema = {
    _id: { type: "string" },
    name: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
};

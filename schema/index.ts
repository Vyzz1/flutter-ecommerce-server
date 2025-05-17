export const errorResponseSchema = {
  message: { type: "string" },
  status: { type: "number" },
  timestamp: { type: "string" },
};

export const userSchema = {
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

export const categorySchema = {
  _id: { type: "string" },
  name: { type: "string" },
  image: { type: "string" },
};

export const attributeSchema = {
  _id: { type: "string" },
  name: { type: "string" },
};

export const variantAttribute = {
  _id: { type: "string" },
  value: { type: "string" },
  attributeId: { type: "string" },
  attribute: {
    type: "object",
    properties: attributeSchema,
  },
};

export const productVariantSchema = {
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
        properties: categorySchema,
      },
    },
  },
  attributes: {
    type: "array",
    items: {
      type: "object",
      properties: variantAttribute,
    },
  },
};

export const shoppingCartSchema = {
  _id: { type: "string" },
  quantity: { type: "number" },
  variant: {
    type: "object",
    properties: productVariantSchema,
  },
};

export const errorResponse = {
  "4xx": { $ref: "ErrorResponse#" },
};

export const commonResponseSchema = (
  properties: Record<string, any>,
  status = 200,
  type = "object"
) => ({
  response: {
    [status]: {
      type: type,
      properties,
    },
    ...errorResponse,
  },
});

export const arrayResponseSchema = (
  properties: Record<string, any>,
  status = 200
) => ({
  response: {
    [status]: {
      type: "array",
      items: {
        type: "object",
        properties,
      },
    },
    ...errorResponse,
  },
});

export const requiredIdParam = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    },
    required: ["id"],
  },
};

export const addressSchema = {
  _id: { type: "string" },
  fullName: { type: "string" },
  phoneNumber: { type: "string" },
  isDefault: { type: "boolean" },
  fullAddress: { type: "string" },
};

export const smallProductSchema = {
  _id: { type: "string" },
  name: { type: "string" },
  avatar: { type: "string", format: "uri" },
  price: { type: "number" },
  productColor: {
    type: "object",
    properties: productVariantSchema,
  },
};

export const productItemSchema = {
  _id: { type: "string" },
  quantity: { type: "number" },
  productSize: {
    type: "object",
    properties: productVariantSchema,
  },
  product: {
    type: "object",
    properties: smallProductSchema,
  },
};

export const orderDetailSchema = {
  _id: { type: "string" },
  quantity: { type: "number" },
  productItem: {
    type: "object",
    properties: productItemSchema,
  },
};
export const orderSchema = {
  _id: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
  user: { type: "string" },
  status: { type: "string" },
  orderDetails: {
    type: "array",
    items: {
      type: "object",
      properties: orderDetailSchema,
    },
  },
  address: { type: "string" },
  fullName: { type: "string" },
  phoneNumber: { type: "string" },
  specify: { type: "string" },
  total: { type: "number" },
  shippingFee: { type: "number" },
};

export const copounSchema = {
  _id: { type: "string" },
  code: { type: "string", pattern: "^[a-zA-Z0-9]{5}$" },
  discount: { type: "number" },
  count: { type: "number" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
  limit: { type: "number" },
};

export const ratingSchema = {
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
    properties: userSchema,
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

export const ratingRequestSchema = {
  _id: { type: "string" },
  images: { type: "array", items: { type: "string" } },
  rating: { type: "number" },
  review: { type: "string" },

  variantId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
};

export const brandSchema = {
  _id: { type: "string" },
  name: { type: "string" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

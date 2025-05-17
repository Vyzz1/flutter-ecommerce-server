import { FastifyPluginAsync } from "fastify";
import couponController from "../controllers/coupon.controller";
import {
  arrayResponseSchema,
  commonResponseSchema,
  copounSchema,
  requiredIdParam,
} from "../schema";
import auth from "../utils/auth";

const couponRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", {
    handler: couponController.handleGetAll,
    schema: {
      ...arrayResponseSchema(copounSchema),
    },
  });

  fastify.get("/order", {
    ...auth.requiredRole(fastify, "admin"),
    handler: couponController.handleGetCouponByCode,
    schema: {
      querystring: {
        type: "object",
        properties: {
          code: { type: "string" },
        },
        required: ["code"],
      },
    },
  });

  fastify.get("/:id", {
    handler: couponController.handleGetById,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(copounSchema),
    },
  });

  fastify.post("/", {
    handler: couponController.handleCreate,
    ...auth.requiredRole(fastify, "admin"),
    schema: {
      body: {
        type: "object",
        properties: copounSchema,
        required: ["code", "discount", "limit"],
      },

      ...commonResponseSchema(copounSchema, 201),
    },
  });

  fastify.patch("/:id", {
    handler: couponController.handleUpdate,
    ...auth.requiredRole(fastify, "admin"),
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        properties: copounSchema,
      },

      ...commonResponseSchema(copounSchema),
    },
  });

  fastify.delete("/:id", {
    handler: couponController.handleDelete,
    ...auth.requiredRole(fastify, "admin"),
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.get("/available", {
    handler: couponController.handleGetAvailableCoupons,
    schema: {
      ...arrayResponseSchema(copounSchema),
    },
  });
};

export default couponRoute;

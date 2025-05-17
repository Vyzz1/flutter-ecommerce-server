import { FastifyPluginAsync } from "fastify";
import brandController from "../controllers/brand.controller";
import {
  arrayResponseSchema,
  brandSchema,
  commonResponseSchema,
  requiredIdParam,
} from "../schema";
import auth from "../utils/auth";

const brandRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", {
    handler: brandController.handleGetBrands,
    schema: {
      ...arrayResponseSchema(brandSchema),
    },
  });

  fastify.post("/", {
    ...auth.requiredRole(fastify, "admin"),
    handler: brandController.handleCreateBrand,
    schema: {
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
      ...commonResponseSchema(brandSchema, 201),
    },
  });

  fastify.delete("/:id", {
    ...auth.requiredRole(fastify, "admin"),

    handler: brandController.handleDeleteBrand,
    schema: {
      ...requiredIdParam,
    },
  });

  fastify.put("/:id", {
    ...auth.requiredRole(fastify, "admin"),

    handler: brandController.handleUpdateBrand,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
      ...commonResponseSchema(brandSchema),
    },
  });
};

export default brandRoute;

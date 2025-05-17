import { FastifyPluginAsync } from "fastify";
import categoryController from "../controllers/category.controller";
import {
  arrayResponseSchema,
  categorySchema,
  commonResponseSchema,
  requiredIdParam,
} from "../schema";
import auth from "../utils/auth";

const categoryRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/", {
    handler: categoryController.handleGetCategories,
    schema: {
      ...arrayResponseSchema(categorySchema),
    },
  });

  fastify.post("/", {
    ...auth.requiredRole(fastify, "admin"),
    handler: categoryController.handleCreateCategory,
    schema: {
      ...commonResponseSchema(categorySchema, 201),
      body: {
        type: "object",
        required: ["name", "image"],
        properties: {
          name: { type: "string" },
          image: { type: "string" },
        },
      },
    },
  });

  fastify.put("/:id", {
    ...auth.requiredRole(fastify, "admin"),
    handler: categoryController.handleUpdateCategory,
    schema: {
      ...commonResponseSchema(categorySchema),
      ...requiredIdParam,
      body: {
        type: "object",
        required: ["name", "image"],
        properties: {
          name: { type: "string" },
          image: { type: "string" },
        },
      },
    },
  });

  fastify.delete("/:id", {
    ...auth.requiredRole(fastify, "admin"),
    handler: categoryController.handleDeleteCategory,
    schema: {
      ...requiredIdParam,
    },
  });
};

export default categoryRoute;

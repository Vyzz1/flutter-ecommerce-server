import { FastifyPluginAsync } from "fastify";
import productAttributeController from "../controllers/product-attribute.controller";
import {
  arrayResponseSchema,
  commonResponseSchema,
  requiredIdParam,
  attributeSchema,
} from "../schema";
import auth from "../utils/auth";

const attributeRoute: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get("/", {
    handler: productAttributeController.handleGetAll,
    schema: {
      ...arrayResponseSchema(attributeSchema),
    },
  });

  fastify.post("/", {
    // ...auth.requiredRole(fastify, "admin"),
    handler: productAttributeController.handleCreate,
    schema: {
      ...commonResponseSchema(attributeSchema, 201),
      body: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
        },
      },
    },
  });

  fastify.put("/:id", {
    handler: productAttributeController.handleEdit,
    schema: {
      ...commonResponseSchema(attributeSchema),
      ...requiredIdParam,
      body: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
        },
      },
    },
  });
};

export default attributeRoute;

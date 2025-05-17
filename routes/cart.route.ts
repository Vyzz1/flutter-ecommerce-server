import { FastifyPluginAsync } from "fastify";
import auth from "../utils/auth";
import cartController from "../controllers/cart.controller";
import {
  arrayResponseSchema,
  commonResponseSchema,
  requiredIdParam,
  shoppingCartSchema,
} from "../schema";

const cartRoute: FastifyPluginAsync = async (fastify) => {
  auth.authRequiredHook(fastify);

  fastify.post<{ Body: ShoppingCartRequest }>("/", {
    handler: cartController.handleCreate,
    schema: {
      body: {
        type: "object",
        required: ["quantity", "variantId"],
        properties: {
          variantId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          quantity: { type: "number", minimum: 1 },
        },
      },
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    handler: cartController.handleDelete,
    schema: {
      ...requiredIdParam,
    },
  });

  fastify.get("/", {
    handler: cartController.handleGetByUser,
    schema: {
      ...arrayResponseSchema(shoppingCartSchema),
    },
  });

  fastify.put("/:id", {
    handler: cartController.handleUpdateQuantity,
    schema: {
      ...requiredIdParam,
      body: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "number", minimum: 1 },
        },
      },
      ...commonResponseSchema(shoppingCartSchema),
    },
  });

  fastify.get<{ Body: ShoppingCartRequest[] }>("/anonymous", {
    handler: cartController.handleGetForAnonymous,
    schema: {
      ...arrayResponseSchema(shoppingCartSchema),
    },
  });
};

export default cartRoute;

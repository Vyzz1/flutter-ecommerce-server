import { FastifyPluginAsync } from "fastify";
import orderController from "../controllers/order.controller";
import auth from "../utils/auth";
import { requiredIdParam } from "../schema";

const orderRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", {
    ...auth.requiredAuth(fastify),
    handler: orderController.handleCreateOrder,
  });

  fastify.get("/", {
    ...auth.requiredRole(fastify, "admin"),
    handler: orderController.handleGetAllOrders,
  });
  fastify.delete("/:id", {
    ...auth.requiredRole(fastify, "admin"),
    handler: orderController.handleDeleteOrder,
    schema: {
      ...requiredIdParam,
      body: {
        type: ["object", "null"],
      },
    },
  });

  fastify.patch("/:id/status", {
    ...auth.requiredRole(fastify, "admin"),
    handler: orderController.handleChangeOrderStatus,
  });

  fastify.get("/user", {
    ...auth.requiredAuth(fastify),
    handler: orderController.handleGetOrderForUser,
  });
  fastify.get("/count", {
    ...auth.requiredAuth(fastify),
    handler: orderController.handleCountOrderForUser,
    schema: {
      response: {
        "200": {
          type: "object",
          properties: {
            pending: { type: "number" },
            processing: { type: "number" },
            shipping: { type: "number" },
            delivered: { type: "number" },
            cancelled: { type: "number" },
          },
        },
      },
    },
  });
};

export default orderRoute;

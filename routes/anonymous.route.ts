import { FastifyPluginAsync } from "fastify";
import cartController from "../controllers/cart.controller";
import { arrayResponseSchema, shoppingCartSchema } from "../schema";
import orderController from "../controllers/order.controller";

const anonymousRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: Array<ShoppingCartRequest> }>("/cart", {
    handler: cartController.handleGetForAnonymous,
    schema: {
      ...arrayResponseSchema(shoppingCartSchema),
    },
  });

  fastify.post("/order", {
    handler: orderController.handleCreateOrderForAnonymous,
    schema: {
      body: {
        type: "object",
        required: ["email", "shippingFee", "address", "details", "totalAmount"],
      },
    },
  });
};

export default anonymousRoute;

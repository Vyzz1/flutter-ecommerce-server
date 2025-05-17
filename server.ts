import Fastify from "fastify";
import authRouter from "./routes/auth.route";
import {
  addressSchema,
  commonResponseSchema,
  errorResponseSchema,
} from "./schema";
import dotenv from "dotenv";
import connectToDB from "./utils/connect";
import passwordRouter from "./routes/password.route";
import addressRouter from "./routes/address.route";
import categoryRoute from "./routes/category.route";
import attributeRoute from "./routes/attribute.route";
import cors from "./config/cors";
import productRoute from "./routes/product.route";
import cartRoute from "./routes/cart.route";
import couponRoute from "./routes/coupon.route";
import ratingRouter from "./routes/rating.route";
import commentRouter from "./routes/comment.route";
import socketIo from "@fastify/websocket";
import anonymousRoute from "./routes/anonymous.route";
import orderRoute from "./routes/order.route";
import conversationRoute from "./routes/conversation.route";
import adminRoute from "./routes/admin.route";
import chatRouter from "./routes/chat.route";
import brandRoute from "./routes/brand.route";
import dashboardRouter from "./routes/dashboard.route";
import geminiService from "./services/gemini.service";
import searchRouter from "./routes/search.route";

dotenv.config();

const fastify = Fastify();

fastify.addSchema({
  $id: "ErrorResponse",
  type: "object",
  properties: {
    ...errorResponseSchema,
  },
});

const schema = commonResponseSchema(
  {
    items: {
      type: "object",
      properties: addressSchema,
    },
  },
  200,
  "array"
);

fastify.get("/", async (request, reply) => {
  return reply.send(schema);
});

//declare plugin

fastify.register(socketIo);

fastify.register(async function (fastify) {
  fastify.get(
    "/hi",
    { websocket: true },
    (socket /* WebSocket */, req /* FastifyRequest */) => {
      socket.on("message", (message) => {
        socket.send("hi from server");
      });
    }
  );
});

declare module "fastify" {
  interface FastifyRequest {
    user: {
      email: string;
      role: string;
      id: string;
    };
  }
}

// plugins

fastify.register(cors);

fastify.register(import("@fastify/cookie"), {
  secret: "mysecret",
});
fastify.register(import("@fastify/auth"));

fastify.register(import("@fastify/swagger"), {
  openapi: {
    info: {
      title: "Fastify API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local server",
      },
    ],
  },
});

//routes

fastify.register(authRouter, { prefix: "/auth" });
fastify.register(passwordRouter, { prefix: "/password" });

fastify.register(addressRouter, { prefix: "/address" });

fastify.register(categoryRoute, { prefix: "/category" });

fastify.register(attributeRoute, { prefix: "/attribute" });

fastify.register(productRoute, { prefix: "/product" });

fastify.register(cartRoute, { prefix: "/cart" });

fastify.register(couponRoute, { prefix: "/coupon" });

fastify.register(ratingRouter, { prefix: "/rating" });

fastify.register(commentRouter, { prefix: "/comment" });

fastify.register(anonymousRoute, { prefix: "/anonymous" });

fastify.register(orderRoute, { prefix: "/order" });

fastify.register(conversationRoute, { prefix: "/conversation" });

fastify.register(chatRouter, { prefix: "/chat" });

fastify.register(adminRoute, { prefix: "/admin" });

fastify.register(brandRoute, { prefix: "/brand" });

fastify.register(dashboardRouter, { prefix: "/dashboard" });

fastify.register(searchRouter, { prefix: "/search" });

fastify.post("/ai/label", async (request, reply) => {
  const { content } = request.body as { content: string };

  const label = await geminiService.labelContent(content);

  return reply.send({ label });
});

fastify.post("/ai/image", async (request, reply) => {
  const { base64 } = request.body as { base64: string };

  const label = await geminiService.labelImage(base64);

  return reply.send({ label });
});

fastify.addHook("onRequest", async (request, reply) => {
  console.log(
    `Request received for  ${request.method} ${request.url} ${
      request.hostname
    }  at ${new Date()} `
  );
});

fastify.addHook("onError", async (request, reply, error) => {
  console.log(`Error occured at ${new Date()} : ${error.message}`);
});

const PORT = parseInt(process.env.PORT || "8080");

fastify.listen({ port: PORT, host: "0.0.0.0" }, async (err, address) => {
  await connectToDB();

  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

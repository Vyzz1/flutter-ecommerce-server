import { FastifyPluginAsync } from "fastify";
import ratingController from "../controllers/rating.controller";
import {
  arrayResponseSchema,
  ratingRequestSchema,
  ratingSchema,
  requiredIdParam,
} from "../schema";
import auth from "../utils/auth";
import ratingService from "../services/rating.service";
import { WebSocket } from "ws";

const ratingRouter: FastifyPluginAsync = async (fastify, options) => {
  const rooms = new Map();
  let activeRaters = new Map();

  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join_product_view":
            handleJoinProductView(connection, data.payload);
            break;
          case "join_product_rating_form":
            handleJoinProductRatingForm(connection, data.payload);
            break;
          case "add_rating":
            await handleAddRating(connection, data.payload);
            break;
          case "start_rating":
            handleStartRating(connection, data.payload);
            break;
          case "stop_rating":
            handleStopRating(connection, data.payload);
            break;
        }
      } catch (error) {
        console.error("Error processing message:", error);
        connection.send(
          JSON.stringify({
            type: "error",
            payload: { message: "Failed to process message" },
          })
        );
      }
    });

    connection.on("close", () => {
      for (const [roomId, users] of rooms.entries()) {
        if (users.has(connection)) {
          const userData = users.get(connection);
          users.delete(connection);

          if (users.size === 0) {
            rooms.delete(roomId);
            activeRaters.delete(roomId);
          } else if (userData.isRatingForm) {
            handleUserDisconnect(roomId, userData);
          }

          console.log(`User ${userData.userName} left room ${roomId}`);
        }
      }
    });
  });

  fastify.get("/product/2/:id", {
    handler: ratingController.handleGetTwoFirstRating,
    schema: {
      ...requiredIdParam,
      ...arrayResponseSchema(ratingSchema),
    },
  });

  fastify.get("/product/:id", {
    handler: ratingController.handleGetAllRating,
    schema: {
      ...requiredIdParam,
      ...arrayResponseSchema(ratingSchema),
    },
  });

  fastify.post<{ Body: RatingRequest }>("/", {
    handler: ratingController.handleCreateRating,
    ...auth.requiredRole(fastify, "customer"),

    schema: {
      body: {
        type: "object",
        required: ["rating", "review", "variantId"],
        properties: ratingRequestSchema,
      },
    },
  });

  function handleJoinProductView(connection: WebSocket, payload: any) {
    const { productId, userId, userName } = payload;
    const roomId = `product_${productId}`;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    if (!activeRaters.has(roomId)) {
      activeRaters.set(roomId, new Set());
    }

    rooms.get(roomId).set(connection, {
      userId,
      userName,
      isRatingForm: false,
    });

    connection.send(
      JSON.stringify({
        type: "active_raters_count",
        payload: {
          productId,
          count: activeRaters.get(roomId).size,
        },
      })
    );

    console.log(`User ${userName} joined product ${productId} view`);
  }

  function handleJoinProductRatingForm(connection: WebSocket, payload: any) {
    const { productId, userId, userName } = payload;
    const roomId = `product_${productId}`;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    if (!activeRaters.has(roomId)) {
      activeRaters.set(roomId, new Set());
    }

    rooms.get(roomId).set(connection, {
      userId,
      userName,
      isRatingForm: true,
    });

    if (!activeRaters.get(roomId).has(userName)) {
      activeRaters.get(roomId).add(userName);

      broadcastToRoom(roomId, {
        type: "user_rating",
        payload: {
          productId,
          userName,
          activeCount: activeRaters.get(roomId).size,
        },
      });
    }

    console.log(`User ${userName} joined product ${productId} rating form`);
  }

  async function handleAddRating(connection: WebSocket, payload: any) {
    const {
      variantId,
      images,
      review,
      rating,
      email,
      userId,
      userName,
      productId,
      orderDetailsId,
    } = payload;
    const roomId = `product_${productId}`;

    try {
      let newRating;

      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        newRating = await ratingService.createRating(
          {
            variantId,
            images,
            review,
            rating,
            orderDetailsId,
          },
          email
        );

        broadcastToRoom(roomId, {
          type: "new_rating",
          payload: {
            rating: newRating,
          },
        });

        if (activeRaters.has(roomId)) {
          const activeSet = activeRaters.get(roomId);
          activeSet.delete(userName);
        }

        broadcastToRoom(roomId, {
          type: "user_stopped_rating",
          payload: {
            productId,
            userName,
            activeCount: activeRaters.get(roomId).size,
          },
        });

        console.log(`User ${userName} added rating to product ${productId}`);
      }
    } catch (error) {
      console.error("Error adding rating:", error);
      connection.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Failed to add rating" },
        })
      );
    }
  }

  function handleStartRating(connection: WebSocket, payload: any) {
    const { productId, userId, userName } = payload;
    const roomId = `product_${productId}`;

    console.log("Start rating", userName);

    if (!activeRaters.has(roomId)) {
      activeRaters.set(roomId, new Set());
    }

    if (!activeRaters.get(roomId).has(userName)) {
      activeRaters.get(roomId).add(userName);

      broadcastToRoom(roomId, {
        type: "user_rating",
        payload: {
          productId,
          userName,
          activeCount: activeRaters.get(roomId).size,
        },
      });
    }
  }

  function handleStopRating(connection: WebSocket, payload: any) {
    const { productId, userId, userName } = payload;
    const roomId = `product_${productId}`;

    console.log("Stop rating", userName);

    if (activeRaters.has(roomId)) {
      activeRaters.get(roomId).delete(userName);

      broadcastToRoom(roomId, {
        type: "user_stopped_rating",
        payload: {
          productId,
          userName,
          activeCount: activeRaters.get(roomId).size,
        },
      });
    }
  }

  function handleUserDisconnect(roomId: string, userData: any) {
    if (activeRaters.has(roomId) && userData.isRatingForm) {
      activeRaters.get(roomId).delete(userData.userName);

      broadcastToRoom(roomId, {
        type: "user_stopped_rating",
        payload: {
          productId: roomId.replace("product_", ""),
          userName: userData.userName,
          activeCount: activeRaters.get(roomId).size,
        },
      });
    }
  }

  function broadcastToRoom(
    roomId: string,
    data: any,
    excludeConnection?: WebSocket
  ) {
    if (!rooms.has(roomId)) return;
    const message = JSON.stringify(data);
    const users = rooms.get(roomId);

    for (const [conn, userData] of users.entries()) {
      if (excludeConnection === undefined || conn !== excludeConnection) {
        conn.send(message);
      }
    }
  }
};

export default ratingRouter;

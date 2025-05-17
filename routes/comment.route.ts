import { FastifyPluginAsync } from "fastify";
import { WebSocket } from "ws";
import commentService from "../services/comment.service";

const rooms = new Map();
let typingUsers = new Map();

const commentRouter: FastifyPluginAsync = async (fastify, options) => {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join_product":
            handleJoinProduct(connection, data.payload);
            break;
          case "add_comment":
            await handleAddComment(connection, data.payload);
            break;
          case "start_typing":
            handleStartTyping(connection, data.payload);
            break;
          case "stop_typing":
            handleStopTyping(connection, data.payload);
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
            typingUsers.delete(roomId);
          } else {
            handleUserDisconnect(roomId, userData);
          }

          console.log(`User ${userData.userName} left room ${roomId}`);
        }
      }
    });
  });

  fastify.get<{ Params: { id: string } }>(
    "/product/:id",
    async (req, reply) => {
      const { id } = req.params;

      const comment = await commentService.getCommentsByProduct(id);
      reply.send(comment);
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/product/2/:id",
    async (req, reply) => {
      const { id } = req.params;

      const comments = await commentService.getFirstTwoComments(id);
      reply.send(comments);
    }
  );
};

function handleJoinProduct(connection: WebSocket, payload: any) {
  const { productId, userId, userName } = payload;
  const roomId = `product_${productId}`;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Set());
  }

  rooms.get(roomId).set(connection, { userId, userName });

  console.log(`User ${userName} joined product ${productId}`);
}

async function handleAddComment(connection: WebSocket, payload: any) {
  const { productId, userId, userName, comment, email } = payload;
  const roomId = `product_${productId}`;

  try {
    var newComment;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      newComment = await commentService.createComment({
        productId,
        userId: undefined,
        guestInfo: { name: userName, email: email },
        content: comment,
        replyTo: "",
      });
    } else {
      newComment = await commentService.createComment({
        productId,
        userId,
        guestInfo: undefined,
        content: comment,
        replyTo: "",
      });
    }
    broadcastToRoom(
      roomId,
      {
        type: "new_comment",
        payload: newComment,
      },
      connection
    );

    if (typingUsers.has(roomId)) {
      const typingSet = typingUsers.get(roomId);
      typingSet.delete(userName);
    }

    broadcastToRoom(roomId, {
      type: "user_stopped_typing",
      payload: { productId, userName },
    });

    console.log(`User ${userName} added comment to product ${productId}`);
  } catch (error) {
    console.error("Error adding comment:", error);
    connection.send(
      JSON.stringify({
        type: "error",
        payload: { message: "Failed to add comment" },
      })
    );
  }
}

function handleStartTyping(connection: WebSocket, payload: any) {
  const { productId, userId, userName } = payload;
  const roomId = `product_${productId}`;

  console.log("Start typing", userName);

  if (!typingUsers.has(roomId)) {
    typingUsers.set(roomId, new Set());
  }

  if (!typingUsers.get(roomId).has(userName)) {
    typingUsers.get(roomId).add(userName);

    broadcastToRoom(
      roomId,
      {
        type: "user_typing",
        payload: { productId, userName },
      },
      connection
    );
  }
}

function handleStopTyping(connection: WebSocket, payload: any) {
  const { productId, userId, userName } = payload;
  const roomId = `product_${productId}`;

  console.log("Stop typing", userName);

  if (typingUsers.has(roomId)) {
    typingUsers.get(roomId).delete(userName);

    broadcastToRoom(
      roomId,
      {
        type: "user_stopped_typing",
        payload: { productId, userName },
      },
      connection
    );
  }
}

function handleUserDisconnect(roomId: string, userData: any) {
  if (typingUsers.has(roomId)) {
    typingUsers.get(roomId).delete(userData.userName);

    broadcastToRoom(roomId, {
      type: "user_stopped_typing",
      payload: {
        productId: roomId.replace("product_", ""),
        userName: userData.userName,
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
    if (data.type === "new_comment" || conn !== excludeConnection) {
      conn.send(message);
    }
  }
}

export default commentRouter;

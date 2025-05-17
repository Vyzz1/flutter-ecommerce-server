import { FastifyPluginAsync } from "fastify";
import { WebSocket } from "ws";
import chatService from "../services/chat.service";
import auth from "../utils/auth";

const conversations = new Map();
const typingUsers = new Map();

const chatRouter: FastifyPluginAsync = async (fastify, options) => {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.on("message", async (message) => {
      console.log("connected");
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join_conversation":
            handleJoinConversation(connection, data.payload);
            break;
          case "send_message":
            await handleSendMessage(connection, data.payload);
            break;
          case "start_typing":
            handleStartTyping(connection, data.payload);
            break;
          case "stop_typing":
            handleStopTyping(connection, data.payload);
            break;
          case "mark_seen":
            await handleMarkSeen(connection, data.payload);
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
      // Remove user from all conversations they were in
      for (const [conversationId, users] of conversations.entries()) {
        if (users.has(connection)) {
          const userData = users.get(connection);
          users.delete(connection);

          // If this was the last user in the conversation, clean up
          if (users.size === 0) {
            conversations.delete(conversationId);
            typingUsers.delete(conversationId);
          } else {
            // Remove from typing users if they were typing
            handleUserDisconnect(conversationId, userData);
          }

          console.log(
            `User ${userData.userId} left conversation ${conversationId}`
          );
        }
      }
    });
  });

  fastify.get<{ Params: { id: string } }>("/conversation/:id", {
    handler: async (req, reply) => {
      const { id } = req.params;
      const messages = await chatService.getMessagesByConversation(id);
      reply.send(messages);
    },
    ...auth.requiredAuth,
  });

  fastify.get("/conversation/all", {
    // ...auth.requiredRole(fastify, "admin"),
    handler: async (req, reply) => {
      const conversations = await chatService.getAllConversations();
      reply.send(conversations);
    },
  });

  fastify.get<{ Params: { id: string } }>(
    "/conversation/recent/:id",
    async (req, reply) => {
      const { id } = req.params;
      const messages = await chatService.getRecentMessages(id, 20);
    }
  );

  fastify.get<{ Querystring: { userId: string } }>("/conversations", {
    handler: async (req, reply) => {
      const userConversations = await chatService.getUserConversations(
        req.query.userId
      );
      reply.send(userConversations);
    },
    ...auth.requiredAuth,
  });
};

function handleJoinConversation(connection: WebSocket, payload: any) {
  const { conversationId, userId, userName } = payload;

  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, new Map());
  }

  if (!typingUsers.has(conversationId)) {
    typingUsers.set(conversationId, new Set());
  }

  conversations.get(conversationId).set(connection, { userId, userName });

  broadcastToConversation(
    conversationId,
    {
      type: "user_joined",
      payload: { conversationId, userId, userName },
    },
    connection
  );

  console.log(`User ${userId} joined conversation ${conversationId}`);
}

async function handleSendMessage(connection: WebSocket, payload: any) {
  const { conversationId, userId, content, images } = payload;

  console.log("send message", payload);

  try {
    const newMessage = {
      conversation: conversationId,
      sender: userId,
      images,
      content,
      seenBy: [userId],
    };

    chatService.createMessage(newMessage);

    chatService.updateConversation(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date(),
      lastMessageSenderId: userId,
      seenBy: [userId],
    });

    broadcastToConversation(conversationId, {
      type: "new_message",
      payload: newMessage,
    });

    broadcastToConversation(conversationId, {
      type: "conversation_updated",
      payload: {
        id: conversationId,
        lastMessage: content,
        lastMessageAt: new Date().toISOString(),
        lastMessageSender: userId,
      },
    });

    if (typingUsers.has(conversationId)) {
      const typingSet = typingUsers.get(conversationId);
      typingSet.delete(userId);
    }

    broadcastToConversation(conversationId, {
      type: "user_stopped_typing",
      payload: { conversationId, userId },
    });

    console.log(
      `User ${userId} sent message to conversation ${conversationId}`
    );
  } catch (error) {
    console.error("Error sending message:", error);
    connection.send(
      JSON.stringify({
        type: "error",
        payload: { message: "Failed to send message" },
      })
    );
  }
}

async function handleMarkSeen(connection: WebSocket, payload: any) {
  const { conversationId, userId } = payload;

  try {
    await chatService.markConversationSeen(conversationId, userId);

    broadcastToConversation(conversationId, {
      type: "messages_seen",
      payload: { conversationId, userId },
    });

    console.log(
      `User ${userId} marked messages as seen in conversation ${conversationId}`
    );
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    connection.send(
      JSON.stringify({
        type: "error",
        payload: { message: "Failed to mark messages as seen" },
      })
    );
  }
}

function handleStartTyping(connection: WebSocket, payload: any) {
  const { conversationId, userId } = payload;

  if (!typingUsers.has(conversationId)) {
    typingUsers.set(conversationId, new Set());
  }

  if (!typingUsers.get(conversationId).has(userId)) {
    typingUsers.get(conversationId).add(userId);

    broadcastToConversation(
      conversationId,
      {
        type: "user_typing",
        payload: { conversationId, userId },
      },
      connection
    );
  }

  console.log(
    `User ${userId} started typing in conversation ${conversationId}`
  );
}

function handleStopTyping(connection: WebSocket, payload: any) {
  const { conversationId, userId } = payload;

  if (typingUsers.has(conversationId)) {
    typingUsers.get(conversationId).delete(userId);

    // Broadcast stop typing notification
    broadcastToConversation(
      conversationId,
      {
        type: "user_stopped_typing",
        payload: { conversationId, userId },
      },
      connection
    );
  }

  console.log(
    `User ${userId} stopped typing in conversation ${conversationId}`
  );
}

function handleUserDisconnect(conversationId: string, userData: any) {
  if (typingUsers.has(conversationId)) {
    typingUsers.get(conversationId).delete(userData.userId);

    broadcastToConversation(conversationId, {
      type: "user_stopped_typing",
      payload: {
        conversationId,
        userId: userData.userId,
      },
    });

    broadcastToConversation(conversationId, {
      type: "user_left",
      payload: {
        conversationId,
        userId: userData.userId,
      },
    });
  }
}

function broadcastToConversation(
  conversationId: string,
  data: any,
  excludeConnection?: WebSocket
) {
  if (!conversations.has(conversationId)) return;

  const message = JSON.stringify(data);
  const users = conversations.get(conversationId);

  for (const [conn, userData] of users.entries()) {
    if (conn !== excludeConnection) {
      conn.send(message);
    }
  }
}

export default chatRouter;

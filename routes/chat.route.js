"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_service_1 = __importDefault(require("../services/chat.service"));
const auth_1 = __importDefault(require("../utils/auth"));
const conversations = new Map();
const typingUsers = new Map();
const chatRouter = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get("/ws", { websocket: true }, (connection, req) => {
        connection.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("connected");
            try {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case "join_conversation":
                        handleJoinConversation(connection, data.payload);
                        break;
                    case "send_message":
                        yield handleSendMessage(connection, data.payload);
                        break;
                    case "start_typing":
                        handleStartTyping(connection, data.payload);
                        break;
                    case "stop_typing":
                        handleStopTyping(connection, data.payload);
                        break;
                    case "mark_seen":
                        yield handleMarkSeen(connection, data.payload);
                        break;
                }
            }
            catch (error) {
                console.error("Error processing message:", error);
                connection.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Failed to process message" },
                }));
            }
        }));
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
                    }
                    else {
                        // Remove from typing users if they were typing
                        handleUserDisconnect(conversationId, userData);
                    }
                    console.log(`User ${userData.userId} left conversation ${conversationId}`);
                }
            }
        });
    });
    fastify.get("/conversation/:id", Object.assign({ handler: (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = req.params;
            const messages = yield chat_service_1.default.getMessagesByConversation(id);
            reply.send(messages);
        }) }, auth_1.default.requiredAuth));
    fastify.get("/conversation/all", {
        // ...auth.requiredRole(fastify, "admin"),
        handler: (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const conversations = yield chat_service_1.default.getAllConversations();
            reply.send(conversations);
        }),
    });
    fastify.get("/conversation/recent/:id", (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const messages = yield chat_service_1.default.getRecentMessages(id, 20);
    }));
    fastify.get("/conversations", Object.assign({ handler: (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const userConversations = yield chat_service_1.default.getUserConversations(req.query.userId);
            reply.send(userConversations);
        }) }, auth_1.default.requiredAuth));
});
function handleJoinConversation(connection, payload) {
    const { conversationId, userId, userName } = payload;
    if (!conversations.has(conversationId)) {
        conversations.set(conversationId, new Map());
    }
    if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
    }
    conversations.get(conversationId).set(connection, { userId, userName });
    broadcastToConversation(conversationId, {
        type: "user_joined",
        payload: { conversationId, userId, userName },
    }, connection);
    console.log(`User ${userId} joined conversation ${conversationId}`);
}
function handleSendMessage(connection, payload) {
    return __awaiter(this, void 0, void 0, function* () {
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
            chat_service_1.default.createMessage(newMessage);
            chat_service_1.default.updateConversation(conversationId, {
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
            console.log(`User ${userId} sent message to conversation ${conversationId}`);
        }
        catch (error) {
            console.error("Error sending message:", error);
            connection.send(JSON.stringify({
                type: "error",
                payload: { message: "Failed to send message" },
            }));
        }
    });
}
function handleMarkSeen(connection, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { conversationId, userId } = payload;
        try {
            yield chat_service_1.default.markConversationSeen(conversationId, userId);
            broadcastToConversation(conversationId, {
                type: "messages_seen",
                payload: { conversationId, userId },
            });
            console.log(`User ${userId} marked messages as seen in conversation ${conversationId}`);
        }
        catch (error) {
            console.error("Error marking messages as seen:", error);
            connection.send(JSON.stringify({
                type: "error",
                payload: { message: "Failed to mark messages as seen" },
            }));
        }
    });
}
function handleStartTyping(connection, payload) {
    const { conversationId, userId } = payload;
    if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
    }
    if (!typingUsers.get(conversationId).has(userId)) {
        typingUsers.get(conversationId).add(userId);
        broadcastToConversation(conversationId, {
            type: "user_typing",
            payload: { conversationId, userId },
        }, connection);
    }
    console.log(`User ${userId} started typing in conversation ${conversationId}`);
}
function handleStopTyping(connection, payload) {
    const { conversationId, userId } = payload;
    if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
        // Broadcast stop typing notification
        broadcastToConversation(conversationId, {
            type: "user_stopped_typing",
            payload: { conversationId, userId },
        }, connection);
    }
    console.log(`User ${userId} stopped typing in conversation ${conversationId}`);
}
function handleUserDisconnect(conversationId, userData) {
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
function broadcastToConversation(conversationId, data, excludeConnection) {
    if (!conversations.has(conversationId))
        return;
    const message = JSON.stringify(data);
    const users = conversations.get(conversationId);
    for (const [conn, userData] of users.entries()) {
        if (conn !== excludeConnection) {
            conn.send(message);
        }
    }
}
exports.default = chatRouter;

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
const rating_controller_1 = __importDefault(require("../controllers/rating.controller"));
const schema_1 = require("../schema");
const auth_1 = __importDefault(require("../utils/auth"));
const rating_service_1 = __importDefault(require("../services/rating.service"));
const ratingRouter = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = new Map();
    let activeRaters = new Map();
    fastify.get("/ws", { websocket: true }, (connection, req) => {
        connection.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
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
                        yield handleAddRating(connection, data.payload);
                        break;
                    case "start_rating":
                        handleStartRating(connection, data.payload);
                        break;
                    case "stop_rating":
                        handleStopRating(connection, data.payload);
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
            for (const [roomId, users] of rooms.entries()) {
                if (users.has(connection)) {
                    const userData = users.get(connection);
                    users.delete(connection);
                    if (users.size === 0) {
                        rooms.delete(roomId);
                        activeRaters.delete(roomId);
                    }
                    else if (userData.isRatingForm) {
                        handleUserDisconnect(roomId, userData);
                    }
                    console.log(`User ${userData.userName} left room ${roomId}`);
                }
            }
        });
    });
    fastify.get("/product/2/:id", {
        handler: rating_controller_1.default.handleGetTwoFirstRating,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.arrayResponseSchema)(schema_1.ratingSchema)),
    });
    fastify.get("/product/:id", {
        handler: rating_controller_1.default.handleGetAllRating,
        schema: Object.assign(Object.assign({}, schema_1.requiredIdParam), (0, schema_1.arrayResponseSchema)(schema_1.ratingSchema)),
    });
    fastify.post("/", Object.assign(Object.assign({ handler: rating_controller_1.default.handleCreateRating }, auth_1.default.requiredRole(fastify, "customer")), { schema: {
            body: {
                type: "object",
                required: ["rating", "review", "variantId"],
                properties: schema_1.ratingRequestSchema,
            },
        } }));
    function handleJoinProductView(connection, payload) {
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
        connection.send(JSON.stringify({
            type: "active_raters_count",
            payload: {
                productId,
                count: activeRaters.get(roomId).size,
            },
        }));
        console.log(`User ${userName} joined product ${productId} view`);
    }
    function handleJoinProductRatingForm(connection, payload) {
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
    function handleAddRating(connection, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { variantId, images, review, rating, email, userId, userName, productId, orderDetailsId, } = payload;
            const roomId = `product_${productId}`;
            try {
                let newRating;
                if (userId.match(/^[0-9a-fA-F]{24}$/)) {
                    newRating = yield rating_service_1.default.createRating({
                        variantId,
                        images,
                        review,
                        rating,
                        orderDetailsId,
                    }, email);
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
            }
            catch (error) {
                console.error("Error adding rating:", error);
                connection.send(JSON.stringify({
                    type: "error",
                    payload: { message: "Failed to add rating" },
                }));
            }
        });
    }
    function handleStartRating(connection, payload) {
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
    function handleStopRating(connection, payload) {
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
    function handleUserDisconnect(roomId, userData) {
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
    function broadcastToRoom(roomId, data, excludeConnection) {
        if (!rooms.has(roomId))
            return;
        const message = JSON.stringify(data);
        const users = rooms.get(roomId);
        for (const [conn, userData] of users.entries()) {
            if (excludeConnection === undefined || conn !== excludeConnection) {
                conn.send(message);
            }
        }
    }
});
exports.default = ratingRouter;

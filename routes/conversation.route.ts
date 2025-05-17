import { FastifyPluginAsync } from "fastify";
import conservationController from "../controllers/conversation.controller";
import auth from "../utils/auth";
import { requiredIdParam } from "../schema";

const conversationRoute: FastifyPluginAsync = async (fastify) => {
  auth.authRequiredHook(fastify);
  fastify.post("/", conservationController.handleCreateConservation);

  fastify.get("/me", conservationController.handleGetUserConversation);

  fastify.delete("/:id", {
    handler: conservationController.handleDeleteConversation,
    ...auth.requiredRole(fastify, "admin"),
    schema: {
      ...requiredIdParam,
    },
  });
};

export default conversationRoute;

import { FastifyPluginAsync } from "fastify";
import adminController from "../controllers/admin.controller";
import {
  arrayResponseSchema,
  commonResponseSchema,
  requiredIdParam,
  userSchema,
} from "../schema";
import auth from "../utils/auth";

const adminRoute: FastifyPluginAsync = async (fastify) => {
  auth.roleRequiredHook(fastify, "admin");
  fastify.get("/users", {
    handler: adminController.handleGetAllUsers,
    schema: {
      ...arrayResponseSchema(userSchema),
    },
  });

  fastify.delete<{ Params: { id: string } }>("/users/:id", {
    handler: adminController.handleDeleteUser,
    schema: {
      ...requiredIdParam,
    },
  });

  fastify.post<{ Params: { id: string } }>("/users/:id/ban", {
    handler: adminController.handleBanUser,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(userSchema),
    },
  });

  fastify.post<{ Params: { id: string } }>("/users/:id/unban", {
    handler: adminController.handleUnBanUser,
    schema: {
      ...requiredIdParam,
      ...commonResponseSchema(userSchema),
    },
  });

  fastify.patch<{ Params: { id: string }; Body: UpdateInformationRequest }>(
    "/users/:id",
    {
      handler: adminController.handleUpdateUser,
      schema: {
        ...requiredIdParam,
        ...commonResponseSchema(userSchema),
      },
    }
  );

  fastify.get("/products", {
    handler: adminController.handleGetAllProducts,
  });

  fastify.delete<{ Params: { id: string } }>("/product/:id", {
    handler: adminController.handleDeleteProduct,
    schema: {
      ...requiredIdParam,
    },
  });
};

export default adminRoute;

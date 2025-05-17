import { FastifyPluginAsync } from "fastify";

import authController from "../controllers/auth.controller";
import {
  commonResponseSchema,
  errorResponseSchema,
  userSchema,
} from "../schema";
import auth from "../utils/auth";

const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterRequest }>("/register", {
    handler: authController.handleRegister,
    schema: {
      ...commonResponseSchema({ message: { type: "string" } }, 201),
      body: {
        type: "object",
        required: ["email", "password", "fullName", "fullAddress"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
          fullName: { type: "string" },
          fullAddress: { type: "string" },
        },
      },
    },
  });

  fastify.post<{ Body: LoginRequest }>("/login", {
    handler: authController.handleLogin,
    schema: {
      ...errorResponseSchema,
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
    },
  });

  fastify.get("/", {
    ...auth.requiredAuth(fastify),

    handler: authController.hanldeGetUser,
    schema: {
      ...commonResponseSchema(userSchema),
    },
  });

  fastify.get("/refresh", {
    handler: authController.handleRefresh,
    schema: {
      ...commonResponseSchema({ accessToken: { type: "string" } }),
    },
  });

  fastify.patch<{ Body: UpdateInformationRequest }>("/update", {
    ...auth.requiredAuth(fastify),
    handler: authController.handleUpdateInformation,
    schema: {
      ...commonResponseSchema(userSchema),
      body: {
        type: "object",
        required: ["fullName"],
        properties: {
          fullName: { type: "string" },
          avatar: { type: "string" },
        },
      },
    },
  });

  fastify.post<{ Body: ChangePasswordRequest }>("/update-password", {
    ...auth.requiredAuth(fastify),
    handler: authController.handleUpdatePassword,
    schema: {
      ...auth.requiredAuth(fastify),
      body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string" },
        },
      },
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });

  fastify.get("/logout", {
    ...auth.requiredAuth(fastify),
    handler: authController.handleLogout,
    schema: {
      ...commonResponseSchema({ message: { type: "string" } }),
    },
  });
};

export default authRouter;

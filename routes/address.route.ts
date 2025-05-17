import { FastifyPluginAsync } from "fastify";
import addressController from "../controllers/address.controller";
import {
  addressSchema,
  arrayResponseSchema,
  commonResponseSchema,
  requiredIdParam,
} from "../schema";
import auth from "../utils/auth";

const addressRouter: FastifyPluginAsync = async (fastify) => {
  auth.authRequiredHook(fastify);

  fastify.get("/", {
    handler: addressController.handleGetAddress,
    schema: {
      ...arrayResponseSchema(addressSchema),
    },
  });

  fastify.post("/", {
    handler: addressController.handleCreateAddress,
    schema: {
      body: {
        type: "object",
        required: ["fullName", "fullAddress", "phoneNumber"],
        properties: {
          fullName: { type: "string" },
          fullAddress: { type: "string" },
          phoneNumber: { type: "string" },
        },
      },
      ...commonResponseSchema(addressSchema, 201),
    },
  });

  fastify.patch<{ Body: AddressRequest; Params: { id: string } }>("/:id", {
    handler: addressController.handleUpdateAddress,
    schema: {
      ...commonResponseSchema(addressSchema),
      ...requiredIdParam,
      body: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          fullAddress: {
            type: "string",
          },
          phoneNumber: { type: "string" },
        },
        required: ["fullName", "fullAddress", "phoneNumber"],
      },
    },
  });

  fastify.delete<{ Params: { id: string } }>("/:id", {
    handler: addressController.handleDeleteAddress,
    schema: {
      ...requiredIdParam,
    },
  });

  fastify.put<{ Body: { id: string } }>("/default", {
    handler: addressController.handleSetDefaultAddress,
    schema: {
      body: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
        },
      },
      ...commonResponseSchema(addressSchema),
    },
  });

  fastify.get("/test", addressController.handleTest);
};

export default addressRouter;

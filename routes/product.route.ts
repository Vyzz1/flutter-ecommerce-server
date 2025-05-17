import { FastifyPluginAsync } from "fastify";
import productController from "../controllers/product.controller";
import auth from "../utils/auth";

const productRoute: FastifyPluginAsync = async (fastify, options) => {
  fastify.post<{ Body: ProductRequest }>("/", {
    ...auth.requiredRole(fastify, "admin"),
    handler: productController.handleCreateProduct,
    schema: {
      body: {
        type: "object",
        required: [
          "name",
          "description",
          "categoryId",
          "variants",
          "attributes",
          "images",
        ],
        properties: {
          attributes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  });

  fastify.get("/:id", productController.handleGetProductDetails);

  fastify.patch("/:id", {
    ...auth.requiredRole(fastify, "admin"),
    handler: productController.handleUpdateProduct,
  });

  fastify.get("/filters", productController.handleFilterProducts);

  fastify.get("/home", productController.handleGetHomeProducts);
};

export default productRoute;

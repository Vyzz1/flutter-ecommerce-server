import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import productService from "../services/product.service";

const handleCreateProduct: RouteHandler<{ Body: ProductRequest }> = async (
  request,
  reply
) => {
  try {
    const product = await productService.createProduct(request.body);
    return reply.status(201).send(product);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetProductDetails: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  try {
    const { id } = request.params;

    const product = await productService.getProductDetails(id);

    return reply.status(200).send(product);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};
const handleUpdateProduct: RouteHandler<{
  Params: { id: string };
  Body: ProductRequest;
}> = async (request, reply) => {
  try {
    const updatedProduct = await productService.updateProduct(
      request.params.id,
      request.body
    );
    return reply.status(200).send(updatedProduct);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleDeleteProduct: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    await productService.deleteProduct(request.params.id);

    return reply.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleFilterProducts: RouteHandler<{
  Querystring: ProductFilterRequest;
}> = async (request, reply) => {
  try {
    const products = await productService.filterProducts(request.query);

    return reply.status(200).send(products);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetHomeProducts: RouteHandler = async (request, reply) => {
  try {
    const products = await productService.getHomepageProducts();

    return reply.status(200).send(products);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

export default {
  handleCreateProduct,
  handleGetProductDetails,
  handleDeleteProduct,
  handleUpdateProduct,
  handleFilterProducts,
  handleGetHomeProducts,
};

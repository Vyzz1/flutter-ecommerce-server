import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import adminService from "../services/admin.service";
import elasticSearchService from "../services/elasticSearch.service";

const handleGetAllUsers: RouteHandler = async (request, reply) => {
  try {
    const users = await adminService.getAllUser();

    return reply.status(200).send(users || []);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleBanUser: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  try {
    const user = await adminService.banUser(id);

    return reply.status(200).send(user);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleUnBanUser: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  const { id } = request.params;

  try {
    const user = await adminService.unBanUser(id);

    return reply.status(200).send(user);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleUpdateUser: RouteHandler<{
  Params: { id: string };
  Body: UpdateInformationRequest;
}> = async (request, reply) => {
  const { id } = request.params;

  try {
    const updatedUser = await adminService.updateUser(id, request.body);

    return reply.status(200).send(updatedUser);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleDeleteUser: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  const { id } = request.params;

  try {
    await adminService.deleteUser(id);

    return reply.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetAllProducts: RouteHandler<{
  Querystring: ProductFilterRequest;
}> = async (request, reply) => {
  try {
    const products = await adminService.getAllProducts(request.query);

    return reply.status(200).send(products || []);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleDeleteProduct: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  const { id } = request.params;

  try {
    await adminService.deleteProduct(id);

    elasticSearchService.deleteProduct(id);
    return reply.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

export default {
  handleGetAllUsers,
  handleDeleteProduct,
  handleUpdateUser,
  handleBanUser,
  handleDeleteUser,
  handleUnBanUser,
  handleGetAllProducts,
};

import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import brandService from "../services/brand.service";

const handleCreateBrand: RouteHandler<{ Body: { name: string } }> = async (
  request,
  reply
) => {
  try {
    const { name } = request.body;

    const brand = await brandService.createBrand(name);

    return reply.status(201).send(brand);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetBrands: RouteHandler = async (request, reply) => {
  try {
    const brands = await brandService.getBrands();

    return reply.status(200).send(brands);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleDeleteBrand: RouteHandler<{ Params: { id: string } }> = async (
  request,
  reply
) => {
  try {
    const { id } = request.params;

    const brand = await brandService.deleteBrand(id);

    return reply.status(200).send(brand);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleUpdateBrand: RouteHandler<{
  Params: { id: string };
  Body: { name: string };
}> = async (request, reply) => {
  try {
    const { id } = request.params;
    const { name } = request.body;

    console.log("update brand", id, name);

    const brand = await brandService.updateBrand(id, name);

    return reply.status(200).send(brand);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

export default {
  handleCreateBrand,
  handleGetBrands,
  handleDeleteBrand,
  handleUpdateBrand,
};

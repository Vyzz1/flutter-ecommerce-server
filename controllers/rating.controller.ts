import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import ratingService from "../services/rating.service";

const handleCreateRating: RouteHandler<{ Body: RatingRequest }> = async (
  request,
  reply
) => {
  const rating = request.body;
  const userEmail = request.user.email;

  try {
    const newRating = await ratingService.createRating(rating, userEmail);
    return reply.send(newRating);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetTwoFirstRating: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  const productId = request.params.id;

  try {
    const ratings = await ratingService.getTwoFirstRating(productId);
    return reply.send(ratings);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

const handleGetAllRating: RouteHandler<{
  Params: { id: string };
}> = async (request, reply) => {
  const productId = request.params.id;

  try {
    const ratings = await ratingService.getAllRating(productId);
    return reply.send(ratings);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(reply, error);
  }
};

export default {
  handleCreateRating,
  handleGetTwoFirstRating,
  handleGetAllRating,
};

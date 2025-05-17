import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import commentService from "../services/comment.service";

const addComment: RouteHandler<{ Body: CommentRequest }> = async (req, res) => {
  try {
    const comment = await commentService.createComment(req.body);

    return res.status(201).send(comment);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetCommentsByProduct: RouteHandler<{
  Params: { id: string };
}> = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByProduct(req.params.id);

    return res.status(200).send(comments);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetTwoComments: RouteHandler<{
  Params: { id: string };
}> = async (req, res) => {
  try {
    const comments = await commentService.getFirstTwoComments(req.params.id);

    return res.status(200).send(comments);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

export default {
  addComment,
  handleGetCommentsByProduct,

  handleGetTwoComments,
};

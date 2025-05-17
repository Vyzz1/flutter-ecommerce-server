import { RouteHandler } from "fastify";
import conservationService from "../services/conservation.service";
import { ErrorResponse } from "../errors/ErrorResponse";

const handleCreateConservation: RouteHandler = async (req, res) => {
  try {
    const { email } = req.user;

    const response = await conservationService.createConversation(email);
    res.status(201).send(response);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetUserConversation: RouteHandler = async (req, res) => {
  try {
    const { id } = req.user;

    const response = await conservationService.getUserConversation(id);
    res.status(200).send(response);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleDeleteConversation: RouteHandler<{
  Params: { id: string };
}> = async (req, res) => {
  try {
    const { id } = req.params;
    await conservationService.deleteConversation(id);
    res.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};
export default {
  handleCreateConservation,
  handleGetUserConversation,
  handleDeleteConversation,
};

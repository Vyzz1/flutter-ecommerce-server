import { RouteHandler } from "fastify";
import shoppingCartService from "../services/shoppingCart.service";
import { ErrorResponse } from "../errors/ErrorResponse";

const handleCreate: RouteHandler<{ Body: ShoppingCartRequest }> = async (
  req,
  res
) => {
  try {
    const user = req.user.id;

    const cart = await shoppingCartService.createShoppingCart(user, req.body);

    return res.status(201).send(cart);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleDelete: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    await shoppingCartService.deleteShoppingCart(id);
    return res.status(204).send();
  } catch (error) {
    return ErrorResponse.sendError(res, error as string, 400);
  }
};

const handleGetByUser: RouteHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await shoppingCartService.getShoppingCart(userId);
    return res.status(200).send(cart);
  } catch (error) {
    return ErrorResponse.sendError(res, error as string, 400);
  }
};

const handleUpdateQuantity: RouteHandler<{
  Params: { id: string };
  Body: ShoppingCartRequest;
}> = async (req, res) => {
  try {
    const cart = await shoppingCartService.updateShoppingCart(
      req.params.id,
      req.body.quantity
    );
    return res.status(200).send(cart);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetForAnonymous: RouteHandler<{
  Body: Array<ShoppingCartRequest>;
}> = async (req, res) => {
  try {
    const cart = await shoppingCartService.getShoppingCartForAnonymousUser(
      req.body
    );

    console.log(cart);
    return res.status(200).send(cart);
  } catch (error) {
    console.error(error);
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

export default {
  handleCreate,
  handleDelete,
  handleGetByUser,
  handleUpdateQuantity,
  handleGetForAnonymous,
};

import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import orderService from "../services/order.service";

const handleCreateOrder: RouteHandler<{ Body: OrderRequest }> = async (
  req,
  res
) => {
  try {
    const email = req.user.email;

    const order = await orderService.createOrderForUser(email, req.body);

    return order;
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleCreateOrderForAnonymous: RouteHandler<{
  Body: OrderRequestAnonymous;
}> = async (req, res) => {
  try {
    const order = await orderService.createOrderForAnonymousUser(req.body);

    return order;
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetAllOrders: RouteHandler<{
  Querystring: GetOrderRequest;
}> = async (req, res) => {
  try {
    // const role = req.user.role;

    // if (role !== "admin") {
    //   return res.status(403).send({ message: "Forbidden" });
    // }

    const orders = await orderService.getAllOrders(req.query);

    return orders;
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleChangeOrderStatus: RouteHandler<{
  Body: { status: string };
  Params: { id: string };
}> = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    return order;
  } catch (error) {
    console.log(error);

    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleDeleteOrder: RouteHandler<{
  Params: { id: string };
}> = async (req, res) => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);
    return res.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetOrderForUser: RouteHandler<{
  Querystring: {
    userId: string;
    status: string;
  };
}> = async (req, res) => {
  try {
    const { userId, status } = req.query;
    const order = await orderService.getOrderForUser(userId, status);
    return order;
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleCountOrderForUser: RouteHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await orderService.getCountOrders(userId);

    return order;
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

export default {
  handleCreateOrder,
  handleCreateOrderForAnonymous,
  handleGetAllOrders,
  handleChangeOrderStatus,
  handleDeleteOrder,
  handleGetOrderForUser,
  handleCountOrderForUser,
};

import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import copounService from "../services/coupon.service";

const handleCreate: RouteHandler<{ Body: CouponRequest }> = async (
  req,
  res
) => {
  try {
    const copoun = await copounService.createCoupon(req.body);

    return res.status(201).send(copoun);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleUpdate: RouteHandler<{
  Body: CouponRequest;
  Params: { id: string };
}> = async (req, res) => {
  try {
    const copoun = await copounService.editCoupon(req.params.id, req.body);

    return res.status(200).send(copoun);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetAll: RouteHandler = async (req, res) => {
  try {
    const copouns = await copounService.getCoupons();

    return res.status(200).send(copouns);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetById: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const copoun = await copounService.findCouponById(req.params.id);

    return res.status(200).send(copoun);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetByCategory: RouteHandler<{
  Params: { category: Array<string> };
}> = async (req, res) => {
  try {
    const coupons = await copounService.findCouponByCategory(
      req.params.category
    );

    return res.status(200).send(coupons);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleDelete: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    await copounService.deleteCoupon(req.params.id);

    return res.status(204).send();
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetAvailableCoupons: RouteHandler = async (req, res) => {
  try {
    const coupons = await copounService.findAvailableCoupons();

    return res.status(200).send(coupons);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

const handleGetCouponByCode: RouteHandler<{
  Params: { code: string };
}> = async (req, res) => {
  const { code } = req.query as { code: string };

  try {
    const coupon = await copounService.findOrderByCode(code);

    return res.status(200).send(coupon);
  } catch (error) {
    return ErrorResponse.sendErrorWithDetails(res, error);
  }
};

export default {
  handleCreate,
  handleUpdate,
  handleGetAll,
  handleGetById,
  handleGetByCategory,
  handleDelete,
  handleGetAvailableCoupons,
  handleGetCouponByCode,
};

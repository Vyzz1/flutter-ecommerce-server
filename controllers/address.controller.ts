import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import addressService from "../services/address.service";

const handleGetAddress: RouteHandler = async (req, res) => {
  try {
    const user = req.user.id;
    const addresses = await addressService.getAddresses(user);

    return res.send(addresses || []);
  } catch (error) {
    console.log(error);

    return ErrorResponse.sendError(res, "Internal Server Error", 500);
  }
};

const handleCreateAddress: RouteHandler<{ Body: AddressRequest }> = async (
  req,
  res
) => {
  try {
    const user = req.user.id;
    console.log(user);

    const { fullAddress, fullName, phoneNumber } = req.body;

    const newAddress = await addressService.createAddress(
      user,
      fullAddress,
      fullName,
      phoneNumber
    );

    if (!newAddress) {
      return ErrorResponse.sendError(res, "Create address failed", 400);
    }

    return res.status(201).send(newAddress.toJSON());
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleUpdateAddress: RouteHandler<{
  Body: AddressRequest;
  Params: { id: string };
}> = async (req, res) => {
  try {
    const { id } = req.params;

    const { fullAddress, fullName, phoneNumber } = req.body;

    const newAddress = await addressService.updateAddress(
      id,
      fullAddress,
      fullName,
      phoneNumber
    );

    if (!newAddress) {
      return ErrorResponse.sendError(res, "Address not found", 404);
    }

    return res.send(newAddress);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleDeleteAddress: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const address = await addressService.deleteAddress(id);
    if (!address) {
      return ErrorResponse.sendError(res, "Address not found", 404);
    }

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleSetDefaultAddress: RouteHandler<{
  Body: { id: string };
}> = async (req, res) => {
  try {
    const { id } = req.body;
    const user = req.user.id;

    const address = await addressService.setDefaultAddress(user, id);

    if (!address) {
      return ErrorResponse.sendError(res, "Address not found", 404);
    }

    return res.send(address);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleTest: RouteHandler = async (req, res) => {
  try {
    return res.send({ message: "Test success" });
  } catch (error) {}
};

export default {
  handleGetAddress,
  handleCreateAddress,
  handleUpdateAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
  handleTest,
};

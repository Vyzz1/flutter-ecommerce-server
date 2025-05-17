import { RouteHandler } from "fastify";
import Attribute from "../models/attribute.model";
import { ErrorResponse } from "../errors/ErrorResponse";

const handleCreate: RouteHandler<{ Body: { name: string } }> = async (
  req,
  res
) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ error: "Name is required" });
    }
    const findExist = await Attribute.findOne({ name }).exec();
    if (findExist) {
      return ErrorResponse.sendError(res, "Attribute already exists", 400);
    }
    const newCategory = await Attribute.create({ name });

    res.status(201).send(newCategory);
  } catch (error) {
    return ErrorResponse.sendServerError(res);
  }
};

const handleEdit: RouteHandler<{
  Params: { id: string };
  Body: { name: string };
}> = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    const attribute = await Attribute.findById(id).exec();

    if (!attribute) {
      return ErrorResponse.sendError(res, "Attribute not found", 404);
    }

    const findExist = await Attribute.findOne({
      name,
      _id: { $ne: id },
    }).exec();

    if (findExist) {
      return ErrorResponse.sendError(res, "Attribute name already exists", 400);
    }

    attribute.name = name;
    await attribute.save();

    res.status(200).send(attribute);
  } catch (error) {
    return ErrorResponse.sendServerError(res);
  }
};

const handleGetAll: RouteHandler = async (req, res) => {
  try {
    const attributes = await Attribute.find().lean().select("_id name").exec();
    return res.send(attributes);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return ErrorResponse.sendServerError(res);
  }
};

export default {
  handleCreate,
  handleEdit,
  handleGetAll,
};

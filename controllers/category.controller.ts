import { RouteHandler } from "fastify";
import { ErrorResponse } from "../errors/ErrorResponse";
import Category from "../models/category.model";

const handleGetCategories: RouteHandler = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    return res.send(categories.length > 0 ? categories : []);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(res, "Internal Server Error", 500);
  }
};

const handleCreateCategory: RouteHandler<{ Body: CategoryRequest }> = async (
  req,
  res
) => {
  try {
    const { name, image } = req.body;
    const findExist = await Category.findOne({ name }).exec();

    if (findExist) {
      return res.status(400).send({ message: "Category already exists." });
    }

    const newCategory = await Category.create({ name, image });
    return res.status(201).send(newCategory);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleUpdateCategory: RouteHandler<{
  Params: { id: string };
  Body: CategoryRequest;
}> = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, image } = req.body;

    const category = await Category.findById(id).exec();

    if (!category) {
      return ErrorResponse.sendError(res, "Category not found", 404);
    }

    const findExist = await Category.findOne({
      name,

      _id: { $ne: id },
    }).exec();

    if (findExist) {
      return ErrorResponse.sendError(res, "Category already exists", 400);
    }

    category.name = name;

    category.image = image;

    await category.save();

    return res.status(200).send(category);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

const handleDeleteCategory: RouteHandler<{ Params: { id: string } }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndDelete({ _id: id }).exec();

    if (!category) {
      return ErrorResponse.sendError(res, "Category not found", 404);
    }

    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendServerError(res);
  }
};

export default {
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
};

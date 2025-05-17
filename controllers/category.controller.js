"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorResponse_1 = require("../errors/ErrorResponse");
const category_model_1 = __importDefault(require("../models/category.model"));
const handleGetCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find().lean();
        return res.send(categories.length > 0 ? categories : []);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendError(res, "Internal Server Error", 500);
    }
});
const handleCreateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, image } = req.body;
        const findExist = yield category_model_1.default.findOne({ name }).exec();
        if (findExist) {
            return res.status(400).send({ message: "Category already exists." });
        }
        const newCategory = yield category_model_1.default.create({ name, image });
        return res.status(201).send(newCategory);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleUpdateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const category = yield category_model_1.default.findById(id).exec();
        if (!category) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Category not found", 404);
        }
        const findExist = yield category_model_1.default.findOne({
            name,
            _id: { $ne: id },
        }).exec();
        if (findExist) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Category already exists", 400);
        }
        category.name = name;
        category.image = image;
        yield category.save();
        return res.status(200).send(category);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleDeleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield category_model_1.default.findOneAndDelete({ _id: id }).exec();
        if (!category) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Category not found", 404);
        }
        return res.status(204).send();
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
exports.default = {
    handleGetCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
};

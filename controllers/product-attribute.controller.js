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
const attribute_model_1 = __importDefault(require("../models/attribute.model"));
const ErrorResponse_1 = require("../errors/ErrorResponse");
const handleCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: "Name is required" });
        }
        const findExist = yield attribute_model_1.default.findOne({ name }).exec();
        if (findExist) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Attribute already exists", 400);
        }
        const newCategory = yield attribute_model_1.default.create({ name });
        res.status(201).send(newCategory);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const attribute = yield attribute_model_1.default.findById(id).exec();
        if (!attribute) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Attribute not found", 404);
        }
        const findExist = yield attribute_model_1.default.findOne({
            name,
            _id: { $ne: id },
        }).exec();
        if (findExist) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Attribute name already exists", 400);
        }
        attribute.name = name;
        yield attribute.save();
        res.status(200).send(attribute);
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleGetAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attributes = yield attribute_model_1.default.find().lean().select("_id name").exec();
        return res.send(attributes);
    }
    catch (error) {
        console.error("Error fetching attributes:", error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
exports.default = {
    handleCreate,
    handleEdit,
    handleGetAll,
};

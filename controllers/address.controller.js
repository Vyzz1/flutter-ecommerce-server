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
const address_service_1 = __importDefault(require("../services/address.service"));
const handleGetAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user.id;
        const addresses = yield address_service_1.default.getAddresses(user);
        return res.send(addresses || []);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendError(res, "Internal Server Error", 500);
    }
});
const handleCreateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user.id;
        console.log(user);
        const { fullAddress, fullName, phoneNumber } = req.body;
        const newAddress = yield address_service_1.default.createAddress(user, fullAddress, fullName, phoneNumber);
        if (!newAddress) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Create address failed", 400);
        }
        return res.status(201).send(newAddress.toJSON());
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleUpdateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullAddress, fullName, phoneNumber } = req.body;
        const newAddress = yield address_service_1.default.updateAddress(id, fullAddress, fullName, phoneNumber);
        if (!newAddress) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Address not found", 404);
        }
        return res.send(newAddress);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleDeleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const address = yield address_service_1.default.deleteAddress(id);
        if (!address) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Address not found", 404);
        }
        return res.status(204).send();
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleSetDefaultAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const user = req.user.id;
        const address = yield address_service_1.default.setDefaultAddress(user, id);
        if (!address) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Address not found", 404);
        }
        return res.send(address);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendServerError(res);
    }
});
const handleTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.send({ message: "Test success" });
    }
    catch (error) { }
});
exports.default = {
    handleGetAddress,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    handleTest,
};

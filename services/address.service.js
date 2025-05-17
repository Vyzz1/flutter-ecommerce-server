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
const AgrumentError_1 = __importDefault(require("../errors/AgrumentError"));
const address_model_1 = __importDefault(require("../models/address.model"));
class AddressService {
    getAddresses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addresses = yield address_model_1.default.find({ user: userId })
                    .sort({
                    isDefault: -1,
                })
                    .exec();
                return addresses || [];
            }
            catch (error) {
                throw new Error("Error fetching addresses");
            }
        });
    }
    createAddress(userId, fullAddress, fullName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newAddress = yield address_model_1.default.create({
                    fullAddress,
                    fullName,
                    phoneNumber,
                    user: userId,
                });
                return newAddress;
            }
            catch (error) {
                throw new Error("Error creating address");
            }
        });
    }
    updateAddress(id, fullAddress, fullName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const address = yield address_model_1.default.findByIdAndUpdate(id, { fullAddress, fullName, phoneNumber }, { new: true });
                if (!address) {
                    throw new AgrumentError_1.default("Address Not Found", 404);
                }
                return address;
            }
            catch (error) {
                if (error instanceof AgrumentError_1.default) {
                    throw error;
                }
                throw new Error();
            }
        });
    }
    deleteAddress(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const address = yield address_model_1.default.findByIdAndDelete(id).exec();
                return address;
            }
            catch (error) {
                throw new Error("Error deleting address");
            }
        });
    }
    setDefaultAddress(userId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield address_model_1.default.updateMany({ user: userId }, { isDefault: false }).exec();
                const address = yield address_model_1.default.findByIdAndUpdate(addressId, { isDefault: true }, { new: true }).exec();
                return address;
            }
            catch (error) {
                throw new Error("Error setting default address");
            }
        });
    }
}
exports.default = new AddressService();

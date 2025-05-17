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
const brand_model_1 = __importDefault(require("../models/brand.model"));
class BrandService {
    getBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            const brands = yield brand_model_1.default.find({})
                .select("-__v")
                .lean()
                .exec();
            return brands;
        });
    }
    createBrand(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findEx = yield brand_model_1.default.findOne({ name }).exec();
                if (findEx) {
                    throw new AgrumentError_1.default("Brand already exists");
                }
                const brand = new brand_model_1.default({ name });
                yield brand.save();
                return brand;
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteBrand(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const brand = yield brand_model_1.default.findByIdAndDelete(id).exec();
            if (!brand) {
                throw new AgrumentError_1.default("Brand not found");
            }
            return brand;
        });
    }
    updateBrand(id, brandName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findEx = yield brand_model_1.default.findOne({
                    name: brandName,
                    _id: { $ne: id },
                }).exec();
                if (findEx) {
                    throw new AgrumentError_1.default("Brand already exists");
                }
                const brandToUpdate = yield brand_model_1.default.findById(id).exec();
                if (!brandToUpdate) {
                    throw new AgrumentError_1.default("Brand not found");
                }
                brandToUpdate.name = brandName;
                yield brandToUpdate.save();
                return brandToUpdate;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new BrandService();

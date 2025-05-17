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
const attribute_model_1 = __importDefault(require("../models/attribute.model"));
const brand_model_1 = __importDefault(require("../models/brand.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const productVariants_model_1 = __importDefault(require("../models/productVariants.model"));
const elasticSearch_service_1 = __importDefault(require("./elasticSearch.service"));
class ProductService {
    constructor() { }
    updateSoldCount(productId, count) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("updating sold count", productId);
                const product = yield product_model_1.default.findById(productId).exec();
                if (!product) {
                    throw new AgrumentError_1.default("Product not found", 404);
                }
                product.soldCount += count;
                console.log("sold count", product.soldCount);
                elasticSearch_service_1.default.updateSoldCount(productId.toString(), product.soldCount);
                yield product.save();
                console.log("product sold count updated", productId, product.soldCount);
            }
            catch (error) {
                console.error("Error updating sold count:", error);
                throw new AgrumentError_1.default("Error updating sold count", 500);
            }
        });
    }
    updateProductRating(productId, rating) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("updating product rating", productId, rating);
                const product = yield product_model_1.default.findById(productId).exec();
                if (!product) {
                    throw new AgrumentError_1.default("Product not found", 404);
                }
                product.totalRatings += 1;
                product.avgRating =
                    (product.avgRating * (product.totalRatings - 1) + rating) /
                        product.totalRatings;
                elasticSearch_service_1.default.updateRating(productId.toString(), product.avgRating, product.totalRatings);
                yield product.save();
                console.log("product rating updated", productId, rating, product.avgRating);
                return product;
            }
            catch (error) {
                console.error("Error updating product rating:", error);
                throw new AgrumentError_1.default("Error updating product rating", 500);
            }
        });
    }
    createProduct(productRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId, variants, name, description, images, attributes, minPrice, minDiscount, brandId: brand, } = productRequest;
                if (attributes.length == 0) {
                    throw new AgrumentError_1.default("Attributes cannot be empty", 400);
                }
                const category = yield category_model_1.default.findById(categoryId).exec();
                if (!category) {
                    throw new AgrumentError_1.default("Category not found", 404);
                }
                const findBrand = yield brand_model_1.default.findById(brand).exec();
                if (!findBrand) {
                    throw new AgrumentError_1.default("Brand not found", 404);
                }
                const product = new product_model_1.default({
                    category: category,
                    name: name,
                    minPrice: minPrice,
                    minDiscount: minDiscount,
                    description: description,
                    images: images || [],
                    attributes: [],
                    brand: findBrand,
                });
                const findAttributes = yield attribute_model_1.default.find({
                    _id: { $in: attributes },
                }).exec();
                product.attributes = findAttributes;
                const attributeMap = new Map(findAttributes.map((attr) => [attr._id.toString(), attr]));
                const productVariants = yield Promise.all(variants.map((variant) => __awaiter(this, void 0, void 0, function* () {
                    const variantAttributes = variant.attributes.map((attribute) => {
                        const findAttribute = attributeMap.get(attribute.attributeId.toString());
                        if (!findAttribute) {
                            throw new AgrumentError_1.default("Not Found Attribute", 404);
                        }
                        return {
                            attribute: findAttribute,
                            value: attribute.value,
                        };
                    });
                    const productVariant = new productVariants_model_1.default({
                        product: product._id,
                        price: variant.price,
                        stock: variant.stock,
                        attributes: variantAttributes,
                        basePrice: variant.basePrice,
                        images: variant.images,
                        discount: variant.discount,
                    });
                    yield productVariant.save();
                    return productVariant._id;
                })));
                product.variants = productVariants;
                yield product.save();
                console.log("product created", product._id.toString());
                elasticSearch_service_1.default.createProduct(product._id.toString(), productRequest);
                return product;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateProduct(id, productRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId, variants, name, description, images, attributes, minPrice, minDiscount, brandId: brand, } = productRequest;
                console.log(brand);
                const category = yield category_model_1.default.findById(categoryId).exec();
                if (!category) {
                    throw new AgrumentError_1.default("Category Not Found", 404);
                }
                const findBrand = yield brand_model_1.default.findById(brand).exec();
                if (!findBrand) {
                    throw new AgrumentError_1.default("Brand Not Found", 404);
                }
                const product = yield product_model_1.default.findById(id).exec();
                if (!product) {
                    throw new AgrumentError_1.default("Product Not Found", 404);
                }
                variants.forEach((v) => console.log(v.id != null && (v === null || v === void 0 ? void 0 : v.id.includes("new"))));
                for (const variant of product.variants) {
                    if (!variants.some((v) => v.id == variant._id.toString())) {
                        console.log("deleting variant", variant._id);
                        yield productVariants_model_1.default.findByIdAndDelete(variant._id).exec();
                    }
                }
                product.name = name;
                product.description = description;
                product.category = category._id;
                product.images = images || [];
                product.minPrice = minPrice;
                product.minDiscount = minDiscount;
                product.brand = findBrand;
                const findAttributes = yield attribute_model_1.default.find({
                    _id: { $in: Array.from(attributes) },
                }).exec();
                const attributeMap = new Map(findAttributes.map((attr) => [attr._id.toString(), attr]));
                const updatedVariants = yield Promise.all(variants.map((variant) => __awaiter(this, void 0, void 0, function* () {
                    const variantAttributes = variant.attributes.map((attribute) => {
                        const findAttribute = attributeMap.get(attribute.attributeId.toString());
                        if (!findAttribute) {
                            throw new Error("Attribute not found");
                        }
                        return {
                            attribute: findAttribute,
                            value: attribute.value,
                        };
                    });
                    if (variant.id != null && (variant === null || variant === void 0 ? void 0 : variant.id.includes("new"))) {
                        console.log("creating new variant");
                        const productVariant = new productVariants_model_1.default({
                            product: product._id,
                            price: variant.price,
                            stock: variant.stock,
                            attributes: variantAttributes,
                            basePrice: variant.basePrice,
                            images: variant.images,
                            discount: variant.discount,
                        });
                        yield productVariant.save();
                        return productVariant._id;
                    }
                    else {
                        console.log("updating variant");
                        const productVariant = yield productVariants_model_1.default.findByIdAndUpdate(variant.id, {
                            product: product._id,
                            price: variant.price,
                            stock: variant.stock,
                            attributes: variantAttributes,
                            basePrice: variant.basePrice,
                            images: variant.images,
                            discount: variant.discount,
                        }, { new: true }).exec();
                        return productVariant._id;
                    }
                })));
                product.variants = updatedVariants;
                elasticSearch_service_1.default.updateProduct(id, productRequest);
                return yield product.save();
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_model_1.default.findByIdAndDelete(id).exec();
            if (!product) {
                throw new AgrumentError_1.default("Product not found", 404);
            }
            elasticSearch_service_1.default.deleteProduct(id);
            yield productVariants_model_1.default.deleteMany({ product: product._id }).exec();
            return;
        });
    }
    getProductDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_model_1.default.findById(id)
                    .populate("category", "name image")
                    .populate("brand", "name _id")
                    .populate("attributes", "name _id")
                    .populate({
                    path: "variants",
                    select: "price stock attributes basePrice images discount _id",
                    populate: {
                        path: "attributes.attribute",
                        select: "name",
                    },
                })
                    .select("-__v")
                    .exec();
                if (!product) {
                    throw new AgrumentError_1.default("Product not found", 404);
                }
                return product;
            }
            catch (error) {
                throw error;
            }
        });
    }
    filterProducts(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 0, limit = 6, sortBy = "createdAt", sortType = "desc", brands = [], minPrice, maxPrice, categories = [], rating, keyword, } = request;
                const query = {};
                if (keyword) {
                    const keywords = keyword.split(/\s+/).filter((k) => k);
                    query.$or = keywords.flatMap((k) => [
                        { name: { $regex: k, $options: "i" } },
                        { description: { $regex: k, $options: "i" } },
                    ]);
                }
                if (minPrice !== undefined || maxPrice !== undefined) {
                    query.minPrice = {};
                    if (minPrice !== undefined) {
                        query.minPrice.$gte = minPrice;
                    }
                    if (maxPrice !== undefined) {
                        query.minPrice.$lte = maxPrice;
                    }
                }
                if (brands.length > 0) {
                    if (brands.length > 0) {
                        query.brand = { $in: brands };
                    }
                }
                if (categories.length > 0) {
                    if (categories.length > 0) {
                        query.category = { $in: categories };
                    }
                }
                if (rating) {
                    switch (rating) {
                        case "BELOW_3":
                            query.avgRating = { $lt: 3 };
                            break;
                        case "3_TO_4":
                            query.avgRating = { $gte: 3, $lt: 4 };
                            break;
                        case "4_TO_5":
                            query.avgRating = { $gte: 4, $lte: 5 };
                            break;
                    }
                }
                const skip = page * limit;
                const sort = {};
                sort[sortBy] = sortType === "asc" ? 1 : -1;
                const total = yield product_model_1.default.countDocuments(query);
                const products = yield product_model_1.default.find(query)
                    .populate("category", "name image")
                    .populate("brand", "name _id")
                    .select("-__v")
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalPages = Math.ceil(total / limit);
                const isNext = page < totalPages;
                const isLast = page === totalPages;
                return {
                    products,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages,
                        isNext,
                        isLast,
                    },
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getBrandIdsByNames(brandNames) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brands = yield brand_model_1.default.find({
                    name: { $in: brandNames },
                })
                    .select("_id")
                    .exec();
                return brands.map((brand) => brand._id);
            }
            catch (error) {
                console.error("Error fetching brand IDs:", error);
                return [];
            }
        });
    }
    getCategoryIdsByNames(categoryNames) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield category_model_1.default.find({
                    name: { $in: categoryNames },
                })
                    .select("_id")
                    .exec();
                return categories.map((category) => category._id);
            }
            catch (error) {
                console.error("Error fetching category IDs:", error);
                return [];
            }
        });
    }
    getHomepageProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const projection = {
                name: 1,
                description: 1,
                slug: 1,
                images: 1,
                minPrice: 1,
                minDiscount: 1,
                soldCount: 1,
                category: 1,
                brand: 1,
                attributes: 1,
                variants: 1,
                createdAt: 1,
                avgRating: 1,
                totalRatings: 1,
            };
            const populateOptions = [
                { path: "category", select: "name image" },
                { path: "brand", select: "name _id" },
                { path: "attributes", select: "name _id" },
            ];
            const createQuery = (filter = {}, sort = {}) => {
                return product_model_1.default.find(filter, projection)
                    .populate(populateOptions)
                    .sort(sort)
                    .limit(6)
                    .lean();
            };
            const laptopCategoryId = "681a0004de092a95376dd554";
            const pcGamingCategoryId = "67cfddb482fc5351a4dd918a";
            const pcOfficeCategoryId = "67cfdf3682fc5351a4dd918f";
            const monitorCategoryId = "6819fbdade092a95376dd54f";
            const keyboardCategoryId = "67ea9408746663a73bec6f9e";
            const [promotional, newProducts, bestSellers, laptops, pcGamings, pcOffices, monitors, keyboards,] = yield Promise.all([
                createQuery({ minDiscount: { $gt: 0 } }, { minDiscount: -1 }),
                createQuery({}, { createdAt: -1 }),
                createQuery({}, { soldCount: -1 }),
                createQuery({ category: laptopCategoryId }),
                createQuery({ category: pcGamingCategoryId }, { createdAt: -1, soldCount: -1 }),
                createQuery({ category: pcOfficeCategoryId }, { createdAt: -1, soldCount: -1 }),
                createQuery({ category: monitorCategoryId }, { createdAt: -1, soldCount: -1 }),
                createQuery({ category: keyboardCategoryId }, { createdAt: -1, soldCount: -1 }),
            ]);
            const result = {
                promotional,
                newProducts,
                bestSellers,
                laptops,
                pcGamings,
                pcOffices,
                monitors,
                keyboards,
            };
            return result;
        });
    }
}
exports.default = new ProductService();

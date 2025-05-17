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
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("elasticsearch");
require("dotenv").config();
class ElasticSearchService {
    constructor() {
        this.bonsaiUrl = process.env.BONSAI_URL || "";
        this.indexName = process.env.ELASTICSEARCH_INDEX_NAME;
        this.client = new elasticsearch_1.Client({
            host: this.bonsaiUrl,
            log: "trace",
        });
    }
    searchContent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.search({
                    index: this.indexName,
                    body: {
                        query: {
                            match_all: {},
                        },
                        size: 10,
                    },
                });
                const products = result.hits.hits.map((hit) => (Object.assign({ _id: hit._id }, hit._source)));
                return products;
            }
            catch (error) {
                console.error("Lỗi khi tìm kiếm:", error);
            }
        });
    }
    createProduct(id, product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.index({
                    index: this.indexName,
                    id: id,
                    body: {
                        name: product.name,
                        brand: product.brandId,
                        category: product.categoryId,
                        minPrice: product.minPrice,
                        minDiscount: product.minDiscount,
                        images: product.images,
                    },
                });
                console.log("Inserted product with id " + result._id + " into Elasticsearch");
                return result;
            }
            catch (error) {
                console.error("Error when inserting to es:", error);
                throw error;
            }
        });
    }
    updateSoldCount(productId, soldCount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.update({
                    index: this.indexName,
                    id: productId,
                    body: {
                        doc: {
                            soldCount: soldCount,
                        },
                    },
                });
                console.log(`Updated sold count for product ${productId}: ${soldCount}`);
                return result;
            }
            catch (error) {
                console.error("Error when updating sold count:", error);
            }
        });
    }
    updateRating(productId, avgRating, totalRatings) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.update({
                    index: this.indexName,
                    id: productId,
                    body: {
                        doc: {
                            avgRating: avgRating,
                            totalRatings: totalRatings,
                        },
                    },
                });
                console.log(`Updated rating for product ${productId}: avgRating=${avgRating}, totalRatings=${totalRatings}`);
                return result;
            }
            catch (error) {
                console.error("Error when updating rating:", error);
            }
        });
    }
    updateProduct(id, product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.update({
                    index: this.indexName,
                    id: id,
                    body: {
                        doc: {
                            name: product.name,
                            brand: product.brandId,
                            category: product.categoryId,
                            minPrice: product.minPrice,
                            minDiscount: product.minDiscount,
                            images: product.images,
                        },
                    },
                });
                return result;
            }
            catch (error) {
                console.error(" Error ", error);
            }
        });
    }
    deleteProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.delete({
                    index: this.indexName,
                    id: productId,
                });
                return result;
            }
            catch (error) {
                console.error("Error when deleting:", error);
            }
        });
    }
    searchAutoComplete(searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("searchText", searchText);
                if (!searchText || searchText.trim() === "") {
                    return [];
                }
                const result = yield this.client.search({
                    index: this.indexName,
                    body: {
                        size: 10,
                        _source: [
                            "name",
                            "brand",
                            "category",
                            "minPrice",
                            "images",
                            "minDiscount",
                            "_id",
                            "avgRating",
                        ],
                        query: {
                            bool: {
                                should: [
                                    {
                                        multi_match: {
                                            query: searchText,
                                            type: "bool_prefix",
                                            fields: [
                                                "name",
                                                "name._2gram",
                                                "name._3gram",
                                                "name._index_prefix",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        highlight: {
                            pre_tags: ["<b>"],
                            post_tags: ["</b>"],
                            fields: {
                                name: {
                                    matched_fields: ["name._index_prefix"],
                                },
                            },
                        },
                    },
                });
                const products = result.hits.hits.map((hit) => (Object.assign({ _id: hit._id }, hit._source)));
                return products;
            }
            catch (error) {
                console.error("Error when autocomplete:", error);
                return [];
            }
        });
    }
}
const elasticSearchService = new ElasticSearchService();
exports.default = elasticSearchService;

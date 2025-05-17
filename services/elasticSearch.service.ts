import { Client } from "elasticsearch";
require("dotenv").config();
class ElasticSearchService {
  private bonsaiUrl: string;
  private client: any;
  private indexName: string;

  constructor() {
    this.bonsaiUrl = process.env.BONSAI_URL || "";
    this.indexName = process.env.ELASTICSEARCH_INDEX_NAME!;

    this.client = new Client({
      host: this.bonsaiUrl,
      log: "trace",
    });
  }

  async searchContent() {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            match_all: {},
          },
          size: 10,
        },
      });

      const products = result.hits.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
      }));
      return products;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  }

  async createProduct(id: string, product: ProductRequest) {
    try {
      const result = await this.client.index({
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

      console.log(
        "Inserted product with id " + result._id + " into Elasticsearch"
      );
      return result;
    } catch (error) {
      console.error("Error when inserting to es:", error);
      throw error;
    }
  }

  async updateSoldCount(productId: string, soldCount: number) {
    try {
      const result = await this.client.update({
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
    } catch (error) {
      console.error("Error when updating sold count:", error);
    }
  }

  async updateRating(
    productId: string,
    avgRating: number,
    totalRatings: number
  ) {
    try {
      const result = await this.client.update({
        index: this.indexName,
        id: productId,
        body: {
          doc: {
            avgRating: avgRating,
            totalRatings: totalRatings,
          },
        },
      });

      console.log(
        `Updated rating for product ${productId}: avgRating=${avgRating}, totalRatings=${totalRatings}`
      );
      return result;
    } catch (error) {
      console.error("Error when updating rating:", error);
    }
  }

  async updateProduct(id: string, product: ProductRequest) {
    try {
      const result = await this.client.update({
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
    } catch (error) {
      console.error(" Error ", error);
    }
  }

  async deleteProduct(productId: string) {
    try {
      const result = await this.client.delete({
        index: this.indexName,
        id: productId,
      });
      return result;
    } catch (error) {
      console.error("Error when deleting:", error);
    }
  }

  async searchAutoComplete(searchText: string) {
    try {
      console.log("searchText", searchText);
      if (!searchText || searchText.trim() === "") {
        return [];
      }

      const result = await this.client.search({
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

      const products = result.hits.hits.map((hit: any) => ({
        _id: hit._id,
        ...hit._source,
      }));
      return products;
    } catch (error) {
      console.error("Error when autocomplete:", error);
      return [];
    }
  }
}

const elasticSearchService = new ElasticSearchService();
export default elasticSearchService;

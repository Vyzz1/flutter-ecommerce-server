import { Query } from "mongoose";
import ArgumentError from "../errors/AgrumentError";
import Attribute from "../models/attribute.model";
import Brand from "../models/brand.model";
import Category from "../models/category.model";
import Product from "../models/product.model";
import ProductVariant from "../models/productVariants.model";
import elasticSearchService from "./elasticSearch.service";

class ProductService {
  constructor() {}

  async updateSoldCount(productId: string, count: number) {
    try {
      console.log("updating sold count", productId);

      const product = await Product.findById(productId).exec();

      if (!product) {
        throw new ArgumentError("Product not found", 404);
      }

      product.soldCount += count;

      console.log("sold count", product.soldCount);

      elasticSearchService.updateSoldCount(
        productId.toString(),
        product.soldCount
      );

      await product.save();

      console.log("product sold count updated", productId, product.soldCount);
    } catch (error) {
      console.error("Error updating sold count:", error);
      throw new ArgumentError("Error updating sold count", 500);
    }
  }

  async updateProductRating(productId: string, rating: number) {
    try {
      console.log("updating product rating", productId, rating);

      const product = await Product.findById(productId).exec();

      if (!product) {
        throw new ArgumentError("Product not found", 404);
      }

      product.totalRatings += 1;

      product.avgRating =
        (product.avgRating * (product.totalRatings - 1) + rating) /
        product.totalRatings;

      elasticSearchService.updateRating(
        productId.toString(),
        product.avgRating,
        product.totalRatings
      );
      await product.save();

      console.log(
        "product rating updated",
        productId,
        rating,
        product.avgRating
      );
      return product;
    } catch (error) {
      console.error("Error updating product rating:", error);
      throw new ArgumentError("Error updating product rating", 500);
    }
  }

  async createProduct(productRequest: ProductRequest) {
    try {
      const {
        categoryId,
        variants,
        name,
        description,
        images,
        attributes,
        minPrice,
        minDiscount,
        brandId: brand,
      } = productRequest;

      if (attributes.length == 0) {
        throw new ArgumentError("Attributes cannot be empty", 400);
      }

      const category = await Category.findById(categoryId).exec();

      if (!category) {
        throw new ArgumentError("Category not found", 404);
      }

      const findBrand = await Brand.findById(brand).exec();
      if (!findBrand) {
        throw new ArgumentError("Brand not found", 404);
      }

      const product = new Product({
        category: category,
        name: name,
        minPrice: minPrice,
        minDiscount: minDiscount,
        description: description,
        images: images || [],
        attributes: [],
        brand: findBrand,
      });

      const findAttributes = await Attribute.find({
        _id: { $in: attributes },
      }).exec();

      product.attributes = findAttributes;

      const attributeMap = new Map(
        findAttributes.map((attr) => [attr._id.toString(), attr])
      );

      const productVariants = await Promise.all(
        variants.map(async (variant) => {
          const variantAttributes = variant.attributes.map((attribute) => {
            const findAttribute = attributeMap.get(
              attribute.attributeId.toString()
            );
            if (!findAttribute) {
              throw new ArgumentError("Not Found Attribute", 404);
            }

            return {
              attribute: findAttribute,
              value: attribute.value,
            };
          });

          const productVariant = new ProductVariant({
            product: product._id,
            price: variant.price,
            stock: variant.stock,
            attributes: variantAttributes,
            basePrice: variant.basePrice,
            images: variant.images,
            discount: variant.discount,
          });

          await productVariant.save();
          return productVariant._id;
        })
      );

      product.variants = productVariants;

      await product.save();

      console.log("product created", product._id.toString());
      elasticSearchService.createProduct(
        product._id.toString(),
        productRequest
      );
      return product;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    productRequest: ProductRequest
  ): Promise<typeof Product> {
    try {
      const {
        categoryId,
        variants,
        name,
        description,
        images,
        attributes,
        minPrice,
        minDiscount,
        brandId: brand,
      } = productRequest;

      console.log(brand);

      const category = await Category.findById(categoryId).exec();
      if (!category) {
        throw new ArgumentError("Category Not Found", 404);
      }

      const findBrand = await Brand.findById(brand).exec();

      if (!findBrand) {
        throw new ArgumentError("Brand Not Found", 404);
      }

      const product = await Product.findById(id).exec();
      if (!product) {
        throw new ArgumentError("Product Not Found", 404);
      }

      variants.forEach((v) =>
        console.log(v.id != null && v?.id.includes("new"))
      );

      for (const variant of product.variants) {
        if (!variants.some((v) => v.id == variant._id.toString())) {
          console.log("deleting variant", variant._id);
          await ProductVariant.findByIdAndDelete(variant._id).exec();
        }
      }

      product.name = name;
      product.description = description;
      product.category = category._id;
      product.images = images || [];
      product.minPrice = minPrice;
      product.minDiscount = minDiscount;

      product.brand = findBrand;

      const findAttributes = await Attribute.find({
        _id: { $in: Array.from(attributes) },
      }).exec();

      const attributeMap = new Map(
        findAttributes.map((attr) => [attr._id.toString(), attr])
      );

      const updatedVariants = await Promise.all(
        variants.map(async (variant) => {
          const variantAttributes = variant.attributes.map((attribute) => {
            const findAttribute = attributeMap.get(
              attribute.attributeId.toString()
            );
            if (!findAttribute) {
              throw new Error("Attribute not found");
            }

            return {
              attribute: findAttribute,
              value: attribute.value,
            };
          });

          if (variant.id != null && variant?.id.includes("new")) {
            console.log("creating new variant");
            const productVariant = new ProductVariant({
              product: product._id,
              price: variant.price,
              stock: variant.stock,
              attributes: variantAttributes,
              basePrice: variant.basePrice,
              images: variant.images,
              discount: variant.discount,
            });

            await productVariant.save();
            return productVariant._id;
          } else {
            console.log("updating variant");
            const productVariant = await ProductVariant.findByIdAndUpdate(
              variant.id,
              {
                product: product._id,
                price: variant.price,
                stock: variant.stock,
                attributes: variantAttributes,
                basePrice: variant.basePrice,
                images: variant.images,
                discount: variant.discount,
              },
              { new: true }
            ).exec();
            return productVariant._id;
          }
        })
      );

      product.variants = updatedVariants;

      elasticSearchService.updateProduct(id, productRequest);

      return await product.save();
    } catch (error) {
      throw error;
    }
  }
  async deleteProduct(id: string): Promise<void> {
    const product = await Product.findByIdAndDelete(id).exec();

    if (!product) {
      throw new ArgumentError("Product not found", 404);
    }

    elasticSearchService.deleteProduct(id);

    await ProductVariant.deleteMany({ product: product._id }).exec();

    return;
  }

  async getProductDetails(id: string): Promise<typeof Product> {
    try {
      const product = await Product.findById(id)
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
        throw new ArgumentError("Product not found", 404);
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  async filterProducts(request: ProductFilterRequest) {
    try {
      const {
        page = 0,
        limit = 6,
        sortBy = "createdAt",
        sortType = "desc",
        brands = [],
        minPrice,
        maxPrice,
        categories = [],
        rating,
        keyword,
      } = request;

      const query: any = {};

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

      const sort: any = {};

      sort[sortBy] = sortType === "asc" ? 1 : -1;

      const total = await Product.countDocuments(query);

      const products = await Product.find(query)
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
    } catch (error) {
      throw error;
    }
  }

  private async getBrandIdsByNames(brandNames: string[]) {
    try {
      const brands = await Brand.find({
        name: { $in: brandNames },
      })
        .select("_id")
        .exec();
      return brands.map((brand) => brand._id);
    } catch (error) {
      console.error("Error fetching brand IDs:", error);
      return [];
    }
  }

  private async getCategoryIdsByNames(categoryNames: string[]) {
    try {
      const categories = await Category.find({
        name: { $in: categoryNames },
      })
        .select("_id")
        .exec();
      return categories.map((category) => category._id);
    } catch (error) {
      console.error("Error fetching category IDs:", error);
      return [];
    }
  }
  async getHomepageProducts() {
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
      return Product.find(filter, projection)
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

    const [
      promotional,
      newProducts,
      bestSellers,
      laptops,
      pcGamings,
      pcOffices,
      monitors,
      keyboards,
    ] = await Promise.all([
      createQuery({ minDiscount: { $gt: 0 } }, { minDiscount: -1 }),

      createQuery({}, { createdAt: -1 }),
      createQuery({}, { soldCount: -1 }),
      createQuery({ category: laptopCategoryId }),
      createQuery(
        { category: pcGamingCategoryId },
        { createdAt: -1, soldCount: -1 }
      ),
      createQuery(
        { category: pcOfficeCategoryId },
        { createdAt: -1, soldCount: -1 }
      ),
      createQuery(
        { category: monitorCategoryId },
        { createdAt: -1, soldCount: -1 }
      ),
      createQuery(
        { category: keyboardCategoryId },
        { createdAt: -1, soldCount: -1 }
      ),
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
  }
}

export default new ProductService();

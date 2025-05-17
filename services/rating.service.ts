import ArgumentError from "../errors/AgrumentError";
import ProductVariant from "../models/productVariants.model";
import Rating from "../models/rating.model";
import User from "../models/user.model";
import OrderDetails from "../models/orderDetails.model";
import productService from "./product.service";
import geminiService from "./gemini.service";

class RatingService {
  async getAllRating(productId: string) {
    try {
      const ratings = await Rating.find({ product: productId })
        .populate("user", "fullName  avatar")
        .populate({
          path: "variant",
          select: "attributes",
          populate: [
            {
              path: "attributes",
              select: "name value",
            },
          ],
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return ratings.map((rating) => {
        const formattedRating = { ...rating };

        if (formattedRating.variant && formattedRating.variant.attributes) {
          formattedRating.variant.attributesString =
            formattedRating.variant.attributes
              .map((attr: { value: string }) => attr.value)
              .join("-");
        }

        return formattedRating;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async createRating(rating: RatingRequest, userEmail: string) {
    try {
      const user = await User.findOne({ email: userEmail }).exec();

      if (!user) {
        throw new ArgumentError("User not found", 404);
      }

      const variant = await ProductVariant.findById(rating.variantId).exec();
      if (!variant) {
        throw new ArgumentError("Variant not found", 404);
      }

      const label = await geminiService.labelContent(rating.review);

      const newRating = await Rating.create({
        ...rating,
        label,
        product: variant?.product,
        variant: variant?._id,
        user: user._id,
      });

      const orderDetails = await OrderDetails.findById(
        rating.orderDetailsId
      ).exec();
      if (!orderDetails) {
        throw new ArgumentError("Order details not found", 404);
      }

      orderDetails.isRated = true;
      await orderDetails.save();

      const populated = await Rating.find({ _id: newRating._id })
        .populate("user", "fullName avatar")
        .populate({
          path: "variant",
          select: "attributes",
          populate: [
            {
              path: "attributes",
              select: "name value",
            },
          ],
        })
        .lean()
        .exec();

      const result = populated.map((rating) => {
        const formattedRating = { ...rating };

        if (formattedRating.variant && formattedRating.variant.attributes) {
          formattedRating.variant.attributesString =
            formattedRating.variant.attributes
              .map((attr: { value: string }) => attr.value)
              .join("-");
        }
        return formattedRating;
      });

      productService.updateProductRating(newRating.product, newRating.rating);

      return result[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTwoFirstRating(productId: string) {
    try {
      const results = await Rating.find({ product: productId })
        .populate({
          path: "user",
          select: "fullName avatar",
        })
        .populate({
          path: "variant",
          select: "attributes",
          populate: [
            {
              path: "attributes",
              select: "name value",
            },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean()
        .exec();

      return results.map((rating) => {
        const formattedRating = { ...rating };

        if (formattedRating.variant && formattedRating.variant.attributes) {
          formattedRating.variant.attributesString =
            formattedRating.variant.attributes
              .map((attr: { value: string }) => attr.value)
              .join("-");
        }

        return formattedRating;
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export default new RatingService();

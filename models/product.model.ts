import { model, models, Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: String,
    description: {
      type: String,
      minlength: [3, "Description must be at least 3 characters"],
    },
    attributes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
      },
    ],

    avgRating: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    minDiscount: {
      type: Number,
      required: true,
    },

    images: {
      type: [String],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
  },
  { timestamps: true }
);

const Product = models?.Product || model("Product", productSchema);

export default Product;

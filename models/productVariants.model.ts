import { model, models, Schema } from "mongoose";
const productVariantSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    variantName: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },

    discount: { type: Number, default: 0 },
    attributes: [
      {
        attribute: {
          type: Schema.Types.ObjectId,
          ref: "Attribute",
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ProductVariant =
  models?.ProductVariant || model("ProductVariant", productVariantSchema);

export default ProductVariant;

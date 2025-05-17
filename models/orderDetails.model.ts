import { Schema, model, models } from "mongoose";

const orderDetailsSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be greater than 0"],
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: false,
    },
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],

    productName: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

const OrderDetails =
  models?.OrderDetails || model("OrderDetails", orderDetailsSchema);

export default OrderDetails;

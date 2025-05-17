import { Schema, model, models } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
    details: [
      { type: Schema.Types.ObjectId, ref: "OrderDetails", required: true },
    ],
    statuses: [
      { type: Schema.Types.ObjectId, ref: "OrderStatus", required: true },
    ],
    currentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      required: true,
    },
    discountCode: {
      type: String,
      required: false,
    },
    loyaltyPoint: {
      type: Number,
      required: false,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Order = models?.Order || model("Order", orderSchema);

export default Order;

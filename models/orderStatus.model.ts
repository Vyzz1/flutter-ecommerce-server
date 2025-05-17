import { Schema, model, models } from "mongoose";

const orderStatusSchema = new Schema({
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    required: true,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderStatus =
  models?.OrderStatus || model("OrderStatus", orderStatusSchema);

export default OrderStatus;

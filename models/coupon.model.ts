import { Schema, model, models } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9]{5}$/.test(v);
        },
      },
      uppercase: true,
    },

    discount: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: false,
      default: 0,
    },
    limit: {
      type: Number,
      required: true,
    },
    order: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

const Coupon = models?.Coupon || model("Coupon", couponSchema);

export default Coupon;

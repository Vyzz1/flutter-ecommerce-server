import { model, models, Schema } from "mongoose";

const ratingSchema = new Schema(
  {
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
    },
    images: {
      type: [String],
      required: false,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    label: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      default: "neutral",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Rating = models?.Rating || model("Rating", ratingSchema);

export default Rating;

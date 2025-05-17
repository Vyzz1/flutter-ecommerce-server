import { Schema, model, models } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    label: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      default: "neutral",
    },
    guestInfo: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre("validate", function (next) {
  if (
    !this.user &&
    (!this.guestInfo || !this.guestInfo.name || !this.guestInfo.email)
  ) {
    this.invalidate(
      "user",
      "Either a user ID or guest information is required"
    );
  }
  next();
});

const Comment = models?.Comment || model("Comment", commentSchema);

export default Comment;

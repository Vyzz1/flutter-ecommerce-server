import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      minLength: [6, "Password is too short"],
    },
    loyaltyPoint: {
      type: Number,
      required: false,
      default: 0,
    },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["customer", "admin"],
      default: "customer",
    },
    avatar: {
      type: String,
      required: false,
    },

    isBanned: {
      type: Boolean,
      required: false,
      default: false,
    },

    isCreateFromAnonymousOrder: {
      type: Boolean,
      required: false,
      default: false,
    },

    refreshToken: {
      type: String,
      required: false,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model("User", userSchema);

export default User;

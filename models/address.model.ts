import { model, models, Schema } from "mongoose";

const addressSchema = new Schema(
  {
    fullAddress: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address = models?.Address || model("Address", addressSchema);

export default Address;

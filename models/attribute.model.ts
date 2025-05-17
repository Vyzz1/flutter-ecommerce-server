import { model, models, Schema } from "mongoose";

const attributeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Attribute = models?.Attribute || model("Attribute", attributeSchema);

export default Attribute;

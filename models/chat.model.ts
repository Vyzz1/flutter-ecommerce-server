import { Schema, model, models } from "mongoose";

const chatModelSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  images:{
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  seenBy: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});

const Chat = models?.Chat || model("Chat", chatModelSchema);

export default Chat;

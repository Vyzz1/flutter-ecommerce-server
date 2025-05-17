import { Schema, model, models } from "mongoose";

const { ObjectId } = Schema.Types;

const ConversationSchema = new Schema({
  user: { type: ObjectId, ref: "User", unique: true },
  lastMessage: { type: String, required: false },
  lastMessageAt: { type: Date, required: false },
  seenBy: [{ type: ObjectId, ref: "User", required: false }],
  createdAt: { type: Date, default: Date.now },
  lastMessageSenderId: { type: ObjectId, ref: "User", required: false },
});

const Conversation =
  models?.Conversation || model("Conversation", ConversationSchema);

export default Conversation;

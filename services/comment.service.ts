import ArgumentError from "../errors/AgrumentError";
import Comment from "../models/comment.model";
import User from "../models/user.model";
import geminiService from "./gemini.service";

class CommentService {
  async createComment(request: CommentRequest) {
    try {
      const { content, productId, userId, guestInfo, replyTo } = request;

      if (!content || !productId) {
        throw new ArgumentError("Comment content and product ID are required");
      }

      if (!userId && (!guestInfo || !guestInfo.name || !guestInfo.email)) {
        throw new ArgumentError(
          "Either user ID or complete guest information is required"
        );
      }

      const label = await geminiService.labelContent(content.trim());
      console.log("Label from Gemini:", label);

      const newComment = new Comment({
        content: content.trim(),
        product: productId,
        label: label.trim(),
      });

      if (userId) {
        const findUser = await User.findById(userId).exec();

        if (!findUser) {
          throw new ArgumentError("User not found", 404);
        }

        newComment.user = userId;
      } else if (guestInfo) {
        newComment.guestInfo = {
          name: guestInfo.name.trim(),
          email: guestInfo.email.trim(),
        };
      }

      if (replyTo) {
        const parentComment = await Comment.findById(replyTo);
        if (!parentComment) {
          throw new Error("Parent comment not found");
        }
        newComment.replyTo = replyTo;
      }

      const comment = await Comment.create(newComment);

      return await this.getCommentById(comment._id.toString());
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async getCommentById(commentId: string) {
    try {
      const comment = await Comment.findById(commentId)
        .populate("user", "name email fullName avatar label")
        .select("-__v")
        .lean()
        .exec();

      if (!comment) {
        throw new ArgumentError("Comment not found", 404);
      }

      return comment;
    } catch (error) {
      console.error("Error getting comment by ID:", error);
      throw error;
    }
  }

  async getCommentsByProduct(productId: string) {
    try {
      const comments = await Comment.find({ product: productId })
        .populate("user", "name email fullName avatar")
        .lean()
        .sort({ createdAt: -1 })
        .select("-__v")
        .exec();

      return comments || [];
    } catch (error) {
      console.error("Error getting comments by product:", error);

      throw error;
    }
  }

  async getFirstTwoComments(productId: string) {
    try {
      const comments = await Comment.find({ product: productId })
        .populate("user", "name email fullName avatar")

        .sort({ createdAt: -1 })
        .limit(2)

        .select("-__v")
        .lean()
        .exec();

      return comments || [];
    } catch (error) {
      console.error("Error getting comments by product:", error);
      throw error;
    }
  }
}

export default new CommentService();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AgrumentError_1 = __importDefault(require("../errors/AgrumentError"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const gemini_service_1 = __importDefault(require("./gemini.service"));
class CommentService {
    createComment(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { content, productId, userId, guestInfo, replyTo } = request;
                if (!content || !productId) {
                    throw new AgrumentError_1.default("Comment content and product ID are required");
                }
                if (!userId && (!guestInfo || !guestInfo.name || !guestInfo.email)) {
                    throw new AgrumentError_1.default("Either user ID or complete guest information is required");
                }
                const label = yield gemini_service_1.default.labelContent(content.trim());
                console.log("Label from Gemini:", label);
                const newComment = new comment_model_1.default({
                    content: content.trim(),
                    product: productId,
                    label: label.trim(),
                });
                if (userId) {
                    const findUser = yield user_model_1.default.findById(userId).exec();
                    if (!findUser) {
                        throw new AgrumentError_1.default("User not found", 404);
                    }
                    newComment.user = userId;
                }
                else if (guestInfo) {
                    newComment.guestInfo = {
                        name: guestInfo.name.trim(),
                        email: guestInfo.email.trim(),
                    };
                }
                if (replyTo) {
                    const parentComment = yield comment_model_1.default.findById(replyTo);
                    if (!parentComment) {
                        throw new Error("Parent comment not found");
                    }
                    newComment.replyTo = replyTo;
                }
                const comment = yield comment_model_1.default.create(newComment);
                return yield this.getCommentById(comment._id.toString());
            }
            catch (error) {
                console.error("Error creating comment:", error);
                throw error;
            }
        });
    }
    getCommentById(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comment = yield comment_model_1.default.findById(commentId)
                    .populate("user", "name email fullName avatar label")
                    .select("-__v")
                    .lean()
                    .exec();
                if (!comment) {
                    throw new AgrumentError_1.default("Comment not found", 404);
                }
                return comment;
            }
            catch (error) {
                console.error("Error getting comment by ID:", error);
                throw error;
            }
        });
    }
    getCommentsByProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comments = yield comment_model_1.default.find({ product: productId })
                    .populate("user", "name email fullName avatar")
                    .lean()
                    .sort({ createdAt: -1 })
                    .select("-__v")
                    .exec();
                return comments || [];
            }
            catch (error) {
                console.error("Error getting comments by product:", error);
                throw error;
            }
        });
    }
    getFirstTwoComments(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comments = yield comment_model_1.default.find({ product: productId })
                    .populate("user", "name email fullName avatar")
                    .sort({ createdAt: -1 })
                    .limit(2)
                    .select("-__v")
                    .lean()
                    .exec();
                return comments || [];
            }
            catch (error) {
                console.error("Error getting comments by product:", error);
                throw error;
            }
        });
    }
}
exports.default = new CommentService();

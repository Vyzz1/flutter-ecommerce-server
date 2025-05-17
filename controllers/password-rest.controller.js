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
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorResponse_1 = require("../errors/ErrorResponse");
const password_reset_token_model_1 = __importDefault(require("../models/password-reset-token.model"));
const crypto_1 = __importDefault(require("crypto"));
const mailer_1 = __importDefault(require("../utils/mailer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const handleSendOTP = (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ email: req.body.email }).exec();
        if (!user) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Your email is not registered", 404);
        }
        yield password_reset_token_model_1.default.deleteMany({ user: user._id }).exec();
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const passwordResetToken = new password_reset_token_model_1.default({
            email: req.body.email,
            token,
            otp,
            user: user._id,
            expiryDate: new Date(Date.now() + 60 * 3 * 1000),
        });
        yield passwordResetToken.save();
        if (!passwordResetToken) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Error sending OTP", 500);
        }
        mailer_1.default.sendMail(user.email, "Reset your password", "forgot-password", {
            otp,
        });
        reply.send({ token });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Error sending OTP");
    }
});
const handleValidateOTP = (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, otp } = req.body;
        const passwordResetToken = yield password_reset_token_model_1.default.findOne({
            token,
            otp,
        }).exec();
        if (!passwordResetToken) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Invalid OTP", 400);
        }
        if (passwordResetToken.expiryDate < new Date()) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "OTP expired", 400);
        }
        const newToken = crypto_1.default.randomBytes(32).toString("hex");
        passwordResetToken.token = newToken;
        yield passwordResetToken.save();
        return reply.send({ token: newToken });
    }
    catch (error) {
        console.error("Error validating OTP:", error);
        throw new Error("Error validating OTP");
    }
});
const handleResetPassword = (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        const passwordResetToken = yield password_reset_token_model_1.default.findOne({
            token,
        }).exec();
        if (!passwordResetToken) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Invalid token", 400);
        }
        if (passwordResetToken.expiryDate < new Date()) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Token expired", 400);
        }
        const newPassword = bcrypt_1.default.hashSync(password, 12);
        const user = yield user_model_1.default.findByIdAndUpdate(passwordResetToken.user, { password: newPassword }, { new: true }).exec();
        if (!user) {
            return ErrorResponse_1.ErrorResponse.sendError(reply, "User not found", 404);
        }
        yield password_reset_token_model_1.default.deleteOne({ token }).exec();
        return reply.send({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        throw new Error("Error resetting password");
    }
});
exports.default = {
    handleSendOTP,
    handleValidateOTP,
    handleResetPassword,
};

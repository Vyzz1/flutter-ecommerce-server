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
const bcrypt_1 = __importDefault(require("bcrypt"));
const address_model_1 = __importDefault(require("../models/address.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const handleRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, fullName, fullAddress } = req.body;
        const user = yield user_model_1.default.findOne({
            email,
            isCreateFromAnonymousOrder: false,
        }).exec();
        if (user) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "Email already exists");
        }
        let newId;
        const anonymouseFind = yield user_model_1.default.findOne({
            email: req.body.email,
            isCreateFromAnonymousOrder: true,
        }).exec();
        newId = (anonymouseFind === null || anonymouseFind === void 0 ? void 0 : anonymouseFind._id) || undefined;
        if (!anonymouseFind) {
            const newUser = yield user_model_1.default.create({
                email,
                password: bcrypt_1.default.hashSync(password, 10),
                fullName,
                role: "customer",
            });
            newId = newUser._id;
        }
        else {
            anonymouseFind.password = bcrypt_1.default.hashSync(password, 10);
            anonymouseFind.email = email;
            anonymouseFind.fullName = fullName;
            anonymouseFind.isCreateFromAnonymousOrder = false;
            yield anonymouseFind.save();
        }
        yield address_model_1.default.create({
            fullAddress,
            fullName,
            isDefault: true,
            user: newId,
        });
        return res.status(201).send({ message: "User registered successfully" });
    }
    catch (error) {
        return ErrorResponse_1.ErrorResponse.sendError(res, "Internal Server Error", 500);
    }
});
const handleLogin = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = request.body;
    const user = yield user_model_1.default.findOne({ email, isCreateFromAnonymousOrder: false })
        .select("-__v -refreshToken")
        .exec();
    if (!user) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "User not found", 400);
    }
    if (user.isBanned) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Your account is blocked", 400);
    }
    const isPasswordValid = bcrypt_1.default.compareSync(password, user.password);
    if (!isPasswordValid) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Invalid password", 400);
    }
    const accessToken = jsonwebtoken_1.default.sign({ email: user.email, role: user.role, id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ email: user.email }, process.env.REFRESH_TOKEN, { expiresIn: "1d" });
    yield user_model_1.default.findOneAndUpdate({ email: user.email }, { refreshToken }, { new: true }).exec();
    const response = {
        accessToken,
        user: user,
    };
    reply
        .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
        path: "/",
    })
        .send(response);
});
const handleRefresh = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    if (!request.cookies.refreshToken) {
        console.log("No refresh token");
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Unauthorized", 401);
    }
    const refreshToken = request.cookies.refreshToken;
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
        if (err) {
            console.log("Invalid refresh token");
            return ErrorResponse_1.ErrorResponse.sendError(reply, "Unauthorized", 401);
        }
    });
    const user = yield user_model_1.default.findOne({ refreshToken }).exec();
    if (!user) {
        console.log("No user found");
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Unauthorized", 401);
    }
    const accessToken = jsonwebtoken_1.default.sign({ email: user.email, role: user.role, id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "15s" });
    return reply.send({ accessToken });
});
const handleUpdateInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user.email;
        const updated = yield user_model_1.default.findOneAndUpdate({ email: user }, req.body, {
            new: true,
        }).exec();
        if (!updated) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "User not found", 400);
        }
        return res.send(updated);
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendError(res, "Internal Server Error", 500);
    }
});
const handleUpdatePassword = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const email = (_a = request.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!email) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Unauthorized", 401);
    }
    const { newPassword, currentPassword } = request.body;
    if (newPassword === currentPassword) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "New password must be different from the old password", 400);
    }
    const user = yield user_model_1.default.findOne({ email }).exec();
    if (!user) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "User not found", 400);
    }
    if (!bcrypt_1.default.compareSync(currentPassword, user.password)) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "Invalid old password", 400);
    }
    if (bcrypt_1.default.compareSync(newPassword, user.password)) {
        return ErrorResponse_1.ErrorResponse.sendError(reply, "New password must be different from the old password", 400);
    }
    user.password = bcrypt_1.default.hashSync(newPassword, 12);
    yield user.save();
    return reply.send({ message: "Password updated successfully" });
});
const handleLogout = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!((_a = request.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken)) {
        return reply.send({ message: "Logout successfully" });
    }
    const refreshToken = (_b = request.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
    const foundUser = yield user_model_1.default.findOne({ refreshToken }).exec();
    if (!foundUser) {
        return reply.send({ message: "Logout successfully" });
    }
    yield user_model_1.default.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } }).exec();
    reply.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
        path: "/",
    });
    reply.send({ message: "Logout successfully" });
});
const hanldeGetUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user.email;
        const foundUser = yield user_model_1.default.findOne({ email: user }).lean().exec();
        if (!foundUser) {
            return ErrorResponse_1.ErrorResponse.sendError(res, "User not found", 404);
        }
        return res.send(Object.assign({}, foundUser));
    }
    catch (error) {
        console.log(error);
        return ErrorResponse_1.ErrorResponse.sendError(res, "Internal Server Error", 500);
    }
});
exports.default = {
    handleRegister,
    handleLogin,
    handleRefresh,
    handleUpdateInformation,
    handleUpdatePassword,
    handleLogout,
    hanldeGetUser,
};

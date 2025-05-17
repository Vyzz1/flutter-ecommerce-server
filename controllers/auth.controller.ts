import { RouteHandler } from "fastify";
import User from "../models/user.model";
import { ErrorResponse } from "../errors/ErrorResponse";
import bcrypt from "bcrypt";
import Address from "../models/address.model";
import jwt from "jsonwebtoken";
import conservationService from "../services/conservation.service";

const handleRegister: RouteHandler<{ Body: RegisterRequest }> = async (
  req,
  res
) => {
  try {
    const { email, password, fullName, fullAddress } = req.body;

    const user = await User.findOne({
      email,
      isCreateFromAnonymousOrder: false,
    }).exec();

    if (user) {
      return ErrorResponse.sendError(res, "Email already exists");
    }

    let newId;

    const anonymouseFind = await User.findOne({
      email: req.body.email,
      isCreateFromAnonymousOrder: true,
    }).exec();

    newId = anonymouseFind?._id || undefined;

    if (!anonymouseFind) {
      const newUser = await User.create({
        email,
        password: bcrypt.hashSync(password, 10),
        fullName,
        role: "customer",
      });
      newId = newUser._id;
    } else {
      anonymouseFind.password = bcrypt.hashSync(password, 10);

      anonymouseFind.email = email;

      anonymouseFind.fullName = fullName;

      anonymouseFind.isCreateFromAnonymousOrder = false;

      await anonymouseFind.save();
    }

    await Address.create({
      fullAddress,
      fullName,
      isDefault: true,
      user: newId,
    });

    return res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    return ErrorResponse.sendError(res, "Internal Server Error", 500);
  }
};

const handleLogin: RouteHandler<{ Body: LoginRequest }> = async (
  request,
  reply
) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email, isCreateFromAnonymousOrder: false })

    .select("-__v -refreshToken")
    .exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  if (user.isBanned) {
    return ErrorResponse.sendError(reply, "Your account is blocked", 400);
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return ErrorResponse.sendError(reply, "Invalid password", 400);
  }

  const accessToken = jwt.sign(
    { email: user.email, role: user.role, id: user._id },
    process.env.ACCESS_TOKEN!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN!,
    { expiresIn: "1d" }
  );

  await User.findOneAndUpdate(
    { email: user.email },
    { refreshToken },
    { new: true }
  ).exec();

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
};

const handleRefresh: RouteHandler = async (request, reply) => {
  if (!request.cookies.refreshToken) {
    console.log("No refresh token");
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const refreshToken = request.cookies.refreshToken;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN!, (err, decoded) => {
    if (err) {
      console.log("Invalid refresh token");
      return ErrorResponse.sendError(reply, "Unauthorized", 401);
    }
  });
  const user = await User.findOne({ refreshToken }).exec();

  if (!user) {
    console.log("No user found");
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const accessToken = jwt.sign(
    { email: user.email, role: user.role, id: user._id },

    process.env.ACCESS_TOKEN!,
    { expiresIn: "15s" }
  );

  return reply.send({ accessToken });
};

const handleUpdateInformation: RouteHandler<{
  Body: UpdateInformationRequest;
}> = async (req, res) => {
  try {
    const user = req.user.email;

    const updated = await User.findOneAndUpdate({ email: user }, req.body, {
      new: true,
    }).exec();

    if (!updated) {
      return ErrorResponse.sendError(res, "User not found", 400);
    }

    return res.send(updated);
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(res, "Internal Server Error", 500);
  }
};

const handleUpdatePassword: RouteHandler<{
  Body: ChangePasswordRequest;
}> = async (request, reply) => {
  const email = request.user?.email;

  if (!email) {
    return ErrorResponse.sendError(reply, "Unauthorized", 401);
  }

  const { newPassword, currentPassword } = request.body;

  if (newPassword === currentPassword) {
    return ErrorResponse.sendError(
      reply,
      "New password must be different from the old password",
      400
    );
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return ErrorResponse.sendError(reply, "User not found", 400);
  }

  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return ErrorResponse.sendError(reply, "Invalid old password", 400);
  }

  if (bcrypt.compareSync(newPassword, user.password)) {
    return ErrorResponse.sendError(
      reply,
      "New password must be different from the old password",
      400
    );
  }

  user.password = bcrypt.hashSync(newPassword, 12);

  await user.save();

  return reply.send({ message: "Password updated successfully" });
};
const handleLogout: RouteHandler = async (request, reply) => {
  if (!request.cookies?.refreshToken) {
    return reply.send({ message: "Logout successfully" });
  }

  const refreshToken = request.cookies?.refreshToken;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    return reply.send({ message: "Logout successfully" });
  }

  await User.updateOne(
    { refreshToken },
    { $unset: { refreshToken: 1 } }
  ).exec();

  reply.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
    path: "/",
  });

  reply.send({ message: "Logout successfully" });
};

const hanldeGetUser: RouteHandler = async (req, res) => {
  try {
    const user = req.user.email;

    const foundUser = await User.findOne({ email: user }).lean().exec();

    if (!foundUser) {
      return ErrorResponse.sendError(res, "User not found", 404);
    }

    return res.send({
      ...foundUser,
    });
  } catch (error) {
    console.log(error);
    return ErrorResponse.sendError(res, "Internal Server Error", 500);
  }
};

export default {
  handleRegister,
  handleLogin,
  handleRefresh,
  handleUpdateInformation,
  handleUpdatePassword,
  handleLogout,
  hanldeGetUser,
};

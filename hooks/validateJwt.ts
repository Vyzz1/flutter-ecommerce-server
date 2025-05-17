import { preHandlerHookHandler } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorResponse } from "../errors/ErrorResponse";
const validateJwt: preHandlerHookHandler = async (request, reply) => {
  const auth = request.headers.authorization;
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const token = auth?.split(" ")[1];
  jwt.verify(token!, process.env.ACCESS_TOKEN!, (err, decoded) => {
    if (err) {
      return ErrorResponse.sendError(reply, err.message, 401);
    }

    request.user = {
      email: (decoded as JwtPayload).email,
      role: (decoded as JwtPayload).role,
      id: (decoded as JwtPayload).id,
    };
  });
};

export default validateJwt;

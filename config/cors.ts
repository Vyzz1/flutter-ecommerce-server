import cors, { FastifyCorsOptions } from "@fastify/cors";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
// const corsOptions: FastifyCorsOptions = {
//   origin: "*",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };

const corsOptions: FastifyCorsOptions = {
  origin: ["*"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
};

async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(cors, corsOptions);
}

export default fp(corsPlugin);

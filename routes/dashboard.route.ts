import { FastifyPluginAsync } from "fastify";
import dashboardController from "../controllers/dashboard.controller";
import auth from "../utils/auth";

const dashboardRouter: FastifyPluginAsync = async (fastify) => {
  auth.roleRequiredHook(fastify, "admin");
  fastify.get("/stats", dashboardController.handleGetStats);

  fastify.get(
    "/chart-comparison",
    dashboardController.handleGetChartComparison
  );
};

export default dashboardRouter;

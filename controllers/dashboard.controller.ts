import { RouteHandler } from "fastify";
import dashboardService from "../services/dashboard.service";

const handleGetStats: RouteHandler<{ Querystring: StatsRequest }> = async (
  request,
  reply
) => {
  try {
    const { fromDate, toDate } = request.query;
    const response = await dashboardService.getStats(fromDate, toDate);
    reply.status(200).send(response);
  } catch (error) {
    console.error("Error fetching stats:", error);
    reply.status(500).send({ error: "Internal Server Error" });
  }
};

const handleGetChartComparison: RouteHandler<{
  Querystring: ChartCompareRequest;
}> = async (request, reply) => {
  try {
    const { fromDate, toDate, groupBy } = request.query;
    const response = await dashboardService.getChartComparison(
      fromDate,
      toDate,
      groupBy
    );
    reply.status(200).send(response);
  } catch (error) {
    console.error("Error fetching chart comparison:", error);
    reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default {
  handleGetStats,
  handleGetChartComparison,
};

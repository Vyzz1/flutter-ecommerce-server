import { FastifyPluginAsync } from "fastify";
import elasticSearchService from "../services/elasticSearch.service";

const searchRouter: FastifyPluginAsync = async (fastify, options) => {
  fastify.get("/", async (request, reply) => {
    return elasticSearchService.searchContent();
  });
  fastify.get("/autocomplete", async (request, reply) => {
    const { searchText } = request.query as { searchText: string };
    const result = await elasticSearchService.searchAutoComplete(searchText);
    return result;
  });
};

export default searchRouter;

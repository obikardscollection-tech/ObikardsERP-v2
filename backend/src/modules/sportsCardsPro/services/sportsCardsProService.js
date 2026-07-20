const { requestSportsCardsPro } = require("../clients/sportsCardsProClient");
const { mapSportsCardsProResponse } = require("../mappers/sportsCardsProMapper");

function assertInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Les parametres SportsCardsPro sont invalides.");
  }
}

function assertEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.trim() === "") {
    throw new Error("Le endpoint SportsCardsPro est invalide.");
  }
}

function createClientParameters(input) {
  return {
    method: input.method,
    query: input.query,
    headers: input.headers,
    body: input.body,
    timeoutMs: input.timeoutMs,
  };
}

/**
 * Orchestrate SportsCardsPro flow from client to mapper.
 * No persistence and no CardReference mutation are performed here.
 * @param {{endpoint:string, method?:string, query?:object, headers?:object, body?:unknown, timeoutMs?:number}} input
 * @returns {Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
async function fetchSportsCardsProMappedData(input) {
  assertInput(input);
  assertEndpoint(input.endpoint);

  const parameters = createClientParameters(input);
  const rawResponse = await requestSportsCardsPro(input.endpoint, parameters);

  return mapSportsCardsProResponse(rawResponse);
}

module.exports = {
  fetchSportsCardsProMappedData,
};

const { requestSportsCardsPro } = require("../clients/sportsCardsProClient");
const { mapSportsCardsProResponse } = require("../mappers/sportsCardsProMapper");
const { prepareCardReferenceEntry } = require("../../reference/services/cardReferenceService");

const INTERNALS = {
  SEARCH: {
    CARD_SEARCH: "/api/products",
    CARD_PRODUCT: "/api/product",
    QUERY_KEY: "q",
    ID_QUERY_KEY: "id",
    CARD_NUMBER_PREFIX: "#",
  },
  CRITERIA: {
    NUMBER_KEY: "number",
    ORDER: ["player", "year", "set", "number", "brand", "season"],
  },
  RESPONSE: {
    PRODUCT_KEYS: ["product", "item", "result", "data"],
    ENTRY_ID_KEYS: ["id", "product-id"],
  },
  REFERENCES: {
    PROVIDER_ID_KEY: "sportsCardsProId",
  },
};

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

function assertSearchCriteria(criteria) {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
    throw new Error("Les criteres SportsCardsPro sont invalides.");
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toSearchPart(value, label) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`Le critere ${label} SportsCardsPro est invalide.`);
  }

  const normalized = String(value).trim();

  if (normalized === "") {
    throw new Error(`Le critere ${label} SportsCardsPro est invalide.`);
  }

  return normalized;
}

function resolveNumberPart(criteria) {
  const rawNumber = criteria.number !== undefined ? criteria.number : criteria.cardNumber;
  const numberPart = toSearchPart(rawNumber, "number");

  if (numberPart === "") {
    return "";
  }

  return `${INTERNALS.SEARCH.CARD_NUMBER_PREFIX}${numberPart}`;
}

function buildSearchQuery(criteria) {
  const queryParts = [];

  for (const key of INTERNALS.CRITERIA.ORDER) {
    let part = "";

    if (key === INTERNALS.CRITERIA.NUMBER_KEY) {
      part = resolveNumberPart(criteria);
    } else {
      part = toSearchPart(criteria[key], key);
    }

    if (part !== "") {
      queryParts.push(part);
    }
  }

  if (queryParts.length === 0) {
    throw new Error("Au moins un critere de recherche SportsCardsPro est requis.");
  }

  return queryParts.join(" ");
}

function buildSearchRequest(criteria) {
  assertSearchCriteria(criteria);

  const query = buildSearchQuery(criteria);

  return {
    endpoint: INTERNALS.SEARCH.CARD_SEARCH,
    method: "GET",
    query: {
      [INTERNALS.SEARCH.QUERY_KEY]: query,
    },
  };
}

function normalizeCardId(id) {
  if (typeof id === "number" && Number.isFinite(id)) {
    return String(id);
  }

  if (typeof id === "string") {
    const normalized = id.trim();

    if (normalized !== "") {
      return normalized;
    }
  }

  throw new Error("L'identifiant SportsCardsPro est invalide.");
}

function hasProductEntryShape(entry) {
  if (!isPlainObject(entry)) {
    return false;
  }

  for (const key of INTERNALS.RESPONSE.ENTRY_ID_KEYS) {
    if (entry[key] !== undefined && entry[key] !== null && String(entry[key]).trim() !== "") {
      return true;
    }
  }

  return false;
}

function adaptProductResponseForMapping(rawResponse) {
  if (!isPlainObject(rawResponse) || hasProductEntryShape(rawResponse)) {
    return rawResponse;
  }

  for (const key of INTERNALS.RESPONSE.PRODUCT_KEYS) {
    const nestedEntry = rawResponse[key];

    if (hasProductEntryShape(nestedEntry)) {
      return nestedEntry;
    }
  }

  return rawResponse;
}

function buildFindCardByIdRequest(id) {
  const normalizedId = normalizeCardId(id);

  return {
    endpoint: INTERNALS.SEARCH.CARD_PRODUCT,
    method: "GET",
    query: {
      [INTERNALS.SEARCH.ID_QUERY_KEY]: normalizedId,
    },
    adaptResponse: adaptProductResponseForMapping,
  };
}

function createSearchByField(field) {
  return async (value, criteria = {}) => {
    assertSearchCriteria(criteria);

    return searchCards({
      ...criteria,
      [field]: value,
    });
  };
}

/**
 * Orchestrate SportsCardsPro flow from client to mapper and CardReference sync.
 * @param {{endpoint:string, method?:string, query?:object, headers?:object, body?:unknown, timeoutMs?:number}} input
 * @returns {Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
async function executeSearch(input) {
  assertInput(input);
  assertEndpoint(input.endpoint);

  const parameters = createClientParameters(input);
  const rawResponse = await requestSportsCardsPro(input.endpoint, parameters);
  const responseToMap =
    typeof input.adaptResponse === "function" ? input.adaptResponse(rawResponse) : rawResponse;
  const mappedResponse = mapSportsCardsProResponse(responseToMap);
  const entries = await Promise.all(
    mappedResponse.entries.map((entry) =>
      prepareCardReferenceEntry(input, entry, INTERNALS.REFERENCES.PROVIDER_ID_KEY)
    )
  );

  return {
    ...mappedResponse,
    entries,
  };
}

/**
 * Search SportsCardsPro using business criteria.
 * @param {{player?:string|number, year?:string|number, set?:string|number, number?:string|number, cardNumber?:string|number, brand?:string|number, season?:string|number}} criteria
 * @returns {Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
async function searchCards(criteria) {
  const request = buildSearchRequest(criteria);

  return executeSearch(request);
}

/**
 * Search SportsCardsPro cards by player.
 * @param {string|number} player
 * @param {{year?:string|number, set?:string|number, number?:string|number, cardNumber?:string|number, brand?:string|number, season?:string|number}} criteria
 * @returns {Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
const searchCardsByPlayer = createSearchByField("player");

/**
 * Search SportsCardsPro cards by year.
 * @type {(year: string|number, criteria?: {player?:string|number, set?:string|number, number?:string|number, cardNumber?:string|number, brand?:string|number, season?:string|number}) => Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
const searchCardsByYear = createSearchByField("year");

/**
 * Search SportsCardsPro cards by set.
 * @type {(setName: string|number, criteria?: {player?:string|number, year?:string|number, number?:string|number, cardNumber?:string|number, brand?:string|number, season?:string|number}) => Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
const searchCardsBySet = createSearchByField("set");

/**
 * Search SportsCardsPro cards by number.
 * @type {(number: string|number, criteria?: {player?:string|number, year?:string|number, set?:string|number, cardNumber?:string|number, brand?:string|number, season?:string|number}) => Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
const searchCardsByNumber = createSearchByField("number");

/**
 * Find one SportsCardsPro card by provider identifier.
 * @param {string|number} id
 * @returns {Promise<{source:string, total:number, entries:object[], raw:unknown}>}
 */
async function findCardById(id) {
  const request = buildFindCardByIdRequest(id);

  return executeSearch(request);
}

module.exports = {
  searchCards,
  searchCardsByPlayer,
  searchCardsByYear,
  searchCardsBySet,
  searchCardsByNumber,
  findCardById,
};

const INTERNALS = {
  ENV: {
    BASE_URL: "SPORTSCARDSPRO_API_BASE_URL",
    TOKEN: "SPORTSCARDSPRO_API_TOKEN",
  },
  HTTP: {
    DEFAULT_METHOD: "GET",
    DEFAULT_TIMEOUT_MS: 15000,
  },
  PARAMS: {
    TOKEN: "t",
  },
  HEADERS: {
    CONTENT_TYPE: "Content-Type",
    ACCEPT: "Accept",
    JSON: "application/json",
  },
  URL: {
    SLASH: "/",
  },
  RUNTIME: {
    FETCH_TYPE: "function",
    ABORT_ERROR_NAME: "AbortError",
  },
};

/**
 * Ensure endpoint is a non-empty string.
 * @param {unknown} endpoint
 */
function assertEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.trim() === "") {
    throw new Error("Le endpoint SportsCardsPro est invalide.");
  }
}

/**
 * Ensure request parameters object is valid when provided.
 * @param {unknown} parameters
 */
function assertParameters(parameters) {
  if (parameters === undefined) {
    return;
  }

  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    throw new Error("Les parametres SportsCardsPro sont invalides.");
  }
}

/**
 * Ensure a token is available.
 * @param {unknown} token
 */
function assertToken(token) {
  if (typeof token !== "string" || token.trim() === "") {
    throw new Error("Le token SportsCardsPro est introuvable.");
  }
}

/**
 * Ensure a base URL is available.
 * @param {unknown} baseUrl
 */
function assertBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new Error("La base URL SportsCardsPro est introuvable.");
  }
}

/**
 * Ensure native fetch is available.
 */
function assertFetchAvailability() {
  if (typeof fetch !== INTERNALS.RUNTIME.FETCH_TYPE) {
    throw new Error("Fetch natif est indisponible dans cet environnement Node.js.");
  }
}

/**
 * Resolve base URL from runtime configuration.
 * @returns {string}
 */
function resolveBaseUrl() {
  return process.env[INTERNALS.ENV.BASE_URL];
}

/**
 * Resolve token from runtime configuration.
 * @returns {string}
 */
function resolveToken() {
  return process.env[INTERNALS.ENV.TOKEN];
}

/**
 * Resolve HTTP method.
 * @param {object} parameters
 * @returns {string}
 */
function resolveMethod(parameters) {
  const method = parameters && parameters.method;

  if (typeof method === "string" && method.trim() !== "") {
    return method.toUpperCase();
  }

  return INTERNALS.HTTP.DEFAULT_METHOD;
}

/**
 * Resolve timeout in milliseconds.
 * @param {object} parameters
 * @returns {number}
 */
function resolveTimeoutMs(parameters) {
  const timeoutMs = parameters && parameters.timeoutMs;

  if (Number.isInteger(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  return INTERNALS.HTTP.DEFAULT_TIMEOUT_MS;
}

/**
 * Resolve query object.
 * @param {object} parameters
 * @returns {object}
 */
function resolveQuery(parameters) {
  const query = parameters && parameters.query;

  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  return query;
}

/**
 * Resolve headers object.
 * @param {object} parameters
 * @returns {object}
 */
function resolveHeaders(parameters) {
  const headers = parameters && parameters.headers;

  if (!headers || typeof headers !== "object" || Array.isArray(headers)) {
    return {
      [INTERNALS.HEADERS.ACCEPT]: INTERNALS.HEADERS.JSON,
      [INTERNALS.HEADERS.CONTENT_TYPE]: INTERNALS.HEADERS.JSON,
    };
  }

  return {
    [INTERNALS.HEADERS.ACCEPT]: INTERNALS.HEADERS.JSON,
    [INTERNALS.HEADERS.CONTENT_TYPE]: INTERNALS.HEADERS.JSON,
    ...headers,
  };
}

/**
 * Resolve request body.
 * @param {object} parameters
 * @returns {string|undefined}
 */
function resolveBody(parameters) {
  if (!parameters || !("body" in parameters)) {
    return undefined;
  }

  if (parameters.body === undefined || parameters.body === null) {
    return undefined;
  }

  if (typeof parameters.body === "string") {
    return parameters.body;
  }

  return JSON.stringify(parameters.body);
}

/**
 * Build full SportsCardsPro URL with token and query string.
 * @param {string} baseUrl
 * @param {string} endpoint
 * @param {string} token
 * @param {object} query
 * @returns {string}
 */
function buildUrl(baseUrl, endpoint, token, query) {
  const normalizedBaseUrl = baseUrl.endsWith(INTERNALS.URL.SLASH)
    ? baseUrl
    : `${baseUrl}${INTERNALS.URL.SLASH}`;
  const normalizedEndpoint = endpoint.startsWith(INTERNALS.URL.SLASH) ? endpoint.slice(1) : endpoint;
  const url = new URL(normalizedEndpoint, normalizedBaseUrl);

  const searchParams = new URLSearchParams();
  searchParams.set(INTERNALS.PARAMS.TOKEN, token);

  for (const key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) {
      continue;
    }

    const value = query[key];

    if (value === undefined || value === null) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  url.search = searchParams.toString();

  return url.toString();
}

/**
 * Build HTTP request configuration.
 * @param {object} parameters
 * @returns {{method:string, headers:object, body:string|undefined, timeoutMs:number}}
 */
function createHttpRequest(parameters) {
  const method = resolveMethod(parameters);
  const headers = resolveHeaders(parameters);
  const body = resolveBody(parameters);
  const timeoutMs = resolveTimeoutMs(parameters);

  return {
    method,
    headers,
    body,
    timeoutMs,
  };
}

/**
 * Perform HTTP request and parse raw JSON response.
 * @param {string} url
 * @param {{method:string, headers:object, body:string|undefined, timeoutMs:number}} request
 * @returns {Promise<unknown>}
 */
async function executeRequest(url, request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), request.timeoutMs);

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
    });

    if (!response || typeof response.ok !== "boolean") {
      throw new Error("La reponse HTTP SportsCardsPro est invalide.");
    }

    if (!response.ok) {
      throw new Error(`Requete SportsCardsPro echouee (HTTP ${response.status}).`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error("La reponse JSON SportsCardsPro est invalide.");
    }
  } catch (error) {
    if (error && error.name === INTERNALS.RUNTIME.ABORT_ERROR_NAME) {
      throw new Error("La requete SportsCardsPro a expire.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Erreur technique lors de la requete SportsCardsPro.");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * SportsCardsPro HTTP client contract (intentionally minimal):
 * - URL construction
 * - Authentication parameter injection
 * - HTTP request execution
 * - Raw JSON response return
 *
 * Explicitly excluded responsibilities:
 * - Rate Limiter
 * - Retry
 * - Cache
 * - Pagination
 * - Search
 * - Product
 * - Mapping
 * - Normalization
 * - Business Rules
 *
 * Send an authenticated SportsCardsPro HTTP request and return raw JSON.
 * @param {string} endpoint
 * @param {{method?:string, query?:object, headers?:object, body?:unknown, timeoutMs?:number}} parameters
 * @returns {Promise<unknown>}
 */
async function requestSportsCardsPro(endpoint, parameters = {}) {
  assertFetchAvailability();
  assertEndpoint(endpoint);
  assertParameters(parameters);

  const baseUrl = resolveBaseUrl();
  const token = resolveToken();

  assertBaseUrl(baseUrl);
  assertToken(token);

  const query = resolveQuery(parameters);
  const url = buildUrl(baseUrl, endpoint, token, query);
  const httpRequest = createHttpRequest(parameters);

  return executeRequest(url, httpRequest);
}

module.exports = {
  requestSportsCardsPro,
};

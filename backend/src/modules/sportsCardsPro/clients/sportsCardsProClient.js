const INTERNALS = {
  ENV: {
    BASE_URL: "SPORTSCARDSPRO_API_BASE_URL",
    TOKEN: "SPORTSCARDSPRO_API_TOKEN",
  },
  PARAMS: {
    TOKEN: "t",
  },
  HTTP: {
    DEFAULT_METHOD: "GET",
    DEFAULT_TIMEOUT_MS: 15000,
  },
  URL: {
    SLASH: "/",
  },
  HEADERS: {
    ACCEPT: "Accept",
    CONTENT_TYPE: "Content-Type",
    JSON: "application/json",
  },
  RUNTIME: {
    FETCH_TYPE: "function",
    ABORT_ERROR_NAME: "AbortError",
  },
};

function assertFetchAvailability() {
  if (typeof fetch !== INTERNALS.RUNTIME.FETCH_TYPE) {
    throw new Error("Fetch natif est indisponible dans cet environnement Node.js.");
  }
}

function assertEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.trim() === "") {
    throw new Error("Le endpoint SportsCardsPro est invalide.");
  }
}

function assertBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new Error("La base URL SportsCardsPro est introuvable.");
  }
}

function assertToken(token) {
  if (typeof token !== "string" || token.trim() === "") {
    throw new Error("Le token SportsCardsPro est introuvable.");
  }
}

function assertParameters(parameters) {
  if (parameters === undefined) {
    return;
  }

  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    throw new Error("Les parametres SportsCardsPro sont invalides.");
  }
}

function resolveBaseUrl() {
  return process.env[INTERNALS.ENV.BASE_URL];
}

function resolveToken() {
  return process.env[INTERNALS.ENV.TOKEN];
}

function resolveMethod(parameters) {
  const method = parameters && parameters.method;

  if (typeof method === "string" && method.trim() !== "") {
    return method.toUpperCase();
  }

  return INTERNALS.HTTP.DEFAULT_METHOD;
}

function resolveQuery(parameters) {
  const query = parameters && parameters.query;

  if (!query || typeof query !== "object" || Array.isArray(query)) {
    return {};
  }

  return query;
}

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

function resolveTimeoutMs(parameters) {
  const timeoutMs = parameters && parameters.timeoutMs;

  if (Number.isInteger(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  return INTERNALS.HTTP.DEFAULT_TIMEOUT_MS;
}

function buildRequestUrl(baseUrl, endpoint, token, query) {
  const normalizedBaseUrl = baseUrl.endsWith(INTERNALS.URL.SLASH)
    ? baseUrl
    : `${baseUrl}${INTERNALS.URL.SLASH}`;
  const normalizedEndpoint = endpoint.startsWith(INTERNALS.URL.SLASH)
    ? endpoint.slice(1)
    : endpoint;
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

function createRequestConfig(parameters) {
  return {
    method: resolveMethod(parameters),
    headers: resolveHeaders(parameters),
    body: resolveBody(parameters),
    timeoutMs: resolveTimeoutMs(parameters),
  };
}

async function executeRequest(url, requestConfig) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestConfig.timeoutMs);

  try {
    const response = await fetch(url, {
      method: requestConfig.method,
      headers: requestConfig.headers,
      body: requestConfig.body,
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
 * Perform one authenticated SportsCardsPro request and return raw response JSON.
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
  const url = buildRequestUrl(baseUrl, endpoint, token, query);
  const requestConfig = createRequestConfig(parameters);

  return executeRequest(url, requestConfig);
}

module.exports = {
  requestSportsCardsPro,
};

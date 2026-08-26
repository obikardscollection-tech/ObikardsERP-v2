function normalizeSearchValue(value, label, strict) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string" && typeof value !== "number") {
    if (strict) {
      throw new Error(`Le critere ${label} est invalide.`);
    }

    return "";
  }

  const normalized = String(value).trim();

  if (normalized === "") {
    if (strict) {
      throw new Error(`Le critere ${label} est invalide.`);
    }

    return "";
  }

  return normalized;
}

function resolveNumberValue(criteria, numberKeys) {
  for (const key of numberKeys) {
    if (criteria[key] !== undefined && criteria[key] !== null) {
      return criteria[key];
    }
  }

  return undefined;
}

/**
 * Build a connector search query from card criteria.
 * @param {object} criteria
 * @param {{order:string[], numberKeys?:string[], numberField?:string, numberPrefix?:string, strict?:boolean}} options
 * @returns {string}
 */
function buildConnectorSearchQuery(criteria, options) {
  const source = criteria && typeof criteria === "object" ? criteria : {};
  const config = options && typeof options === "object" ? options : {};

  const order = Array.isArray(config.order) ? config.order : [];
  const numberKeys = Array.isArray(config.numberKeys)
    ? config.numberKeys
    : ["number", "cardNumber"];
  const subsetKey = typeof config.subsetKey === "string" ? config.subsetKey : "subset";
  const numberField = typeof config.numberField === "string" ? config.numberField : "number";
  const numberPrefix = typeof config.numberPrefix === "string" ? config.numberPrefix : "#";
  const strict = Boolean(config.strict);

  const queryParts = [];

  for (const key of order) {
    if (key === numberField) {
      const rawNumberValue = resolveNumberValue(source, numberKeys);
      const numberPart = normalizeSearchValue(rawNumberValue, key, strict);

      if (numberPart !== "") {
        queryParts.push(`${numberPrefix}${numberPart}`);
      }

      continue;
    }

    if (key === subsetKey) {
      const part = normalizeSearchValue(source[key], key, strict);
      if (part !== "") {
        queryParts.push(part);
      }
      continue;
    }

    const part = normalizeSearchValue(source[key], key, strict);

    if (part !== "") {
      queryParts.push(part);
    }
  }

  return queryParts.join(" ");
}

module.exports = {
  buildConnectorSearchQuery,
};

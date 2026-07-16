const { createSportsCardsProCsvContext } = require("./sportsCardsProCsvAdapter");

const INTERNALS = {
	TYPES: {
		CSV: "csv",
	},
	HANDLERS: {
		csv: createSportsCardsProCsvContext,
	},
};

/**
 * Ensure orchestrator input is a plain object.
 * @param {unknown} input
 */
function assertInput(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new Error("Les parametres SportsCardsPro sont invalides.");
	}
}

/**
 * Ensure import type is supported when provided.
 * @param {unknown} type
 * @param {string} resolvedType
 */
function assertSupportedType(type, resolvedType) {
	if (type !== undefined && (typeof type !== "string" || type.trim() === "")) {
		throw new Error("Le type d'import SportsCardsPro est invalide.");
	}

	if (!INTERNALS.HANDLERS[resolvedType]) {
		throw new Error("Le type d'import SportsCardsPro n'est pas supporte.");
	}
}

/**
 * Resolve SportsCardsPro import type.
 * @param {unknown} type
 * @returns {string}
 */
function resolveImportType(type) {
	if (typeof type === "string" && type.trim() !== "") {
		return type;
	}

	return INTERNALS.TYPES.CSV;
}

/**
 * Delegate SportsCardsPro import to the specialized component.
 * @param {object} input
 * @returns {object}
 */
function createSportsCardsProImport(input = {}) {
	assertInput(input);

	const importType = resolveImportType(input.type);
	assertSupportedType(input.type, importType);
	const handler = INTERNALS.HANDLERS[importType];

	return handler(input);
}

module.exports = {
	createSportsCardsProImport,
};

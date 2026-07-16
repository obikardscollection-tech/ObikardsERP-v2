const { createMarketEngineContext } = require("../engine/common/context");

const INTERNALS = {
	PROVIDER: "sportscardspro-csv",
};

/**
 * Ensure adapter input is a plain object.
 * @param {unknown} input
 */
function assertInput(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new Error("Les parametres d'import SportsCardsPro CSV sont invalides.");
	}
}

/**
 * Ensure file path is a non-empty string.
 * @param {unknown} filePath
 */
function assertFilePath(filePath) {
	if (typeof filePath !== "string" || filePath.trim() === "") {
		throw new Error("Le chemin du fichier SportsCardsPro CSV est requis.");
	}
}

/**
 * Ensure options are valid when provided.
 * @param {unknown} options
 */
function assertOptions(options) {
	if (options === undefined) {
		return;
	}

	if (!options || typeof options !== "object" || Array.isArray(options)) {
		throw new Error("Les options SportsCardsPro CSV doivent etre un objet.");
	}
}

/**
 * Create a Market Engine context compatible with the Core pipeline.
 * @param {{provider?:string, filePath:string, options?:object}} input
 * @returns {object}
 */
function createSportsCardsProCsvContext(input = {}) {
	assertInput(input);
	assertFilePath(input.filePath);
	assertOptions(input.options);

	return createMarketEngineContext({
		provider: INTERNALS.PROVIDER,
		filePath: input.filePath,
	});
}

module.exports = {
	createSportsCardsProCsvContext,
};

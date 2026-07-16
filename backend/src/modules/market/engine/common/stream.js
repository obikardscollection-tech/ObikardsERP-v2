/**
 * Helpers Streams partagés par le Market Engine.
 *
 * Ce module centralise les utilitaires réutilisables par les moteurs
 * CSV, API et les futurs connecteurs.
 *
 * Helpers prévus :
 * - extractLine()
 * - readFirstChunk()
 * - detectBom()
 * - createSafeReadStream()
 */

function extractLine(buffer) {
	const newLineIndex = buffer.indexOf("\n");

	if (newLineIndex === -1) {
		return null;
	}

	const line = buffer.slice(0, newLineIndex).replace(/\r$/, "");
	const rest = buffer.slice(newLineIndex + 1);

	return {
		line,
		rest,
	};
}

module.exports = {
	extractLine,
};

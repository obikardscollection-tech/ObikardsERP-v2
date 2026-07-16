const fs = require("fs");
const fsPromises = require("fs/promises");
const { StringDecoder } = require("string_decoder");
const { parse } = require("csv-parse");
const { extractLine } = require("../common/stream");
// Les séparateurs "," et ";" sont testés avec csv-parse afin de laisser le parser
// interpréter correctement les guillemets, les colonnes et les valeurs.
// Le séparateur retenu est celui produisant le plus grand nombre de colonnes.

function parseHeaderLineWithDelimiter(headerLine, delimiter) {
	return new Promise((resolve, reject) => {
		const parser = parse({
			delimiter,
			relax_quotes: true,
			trim: true,
			bom: true,
		});

		let record = null;

		parser.on("readable", () => {
			let row;

			while ((row = parser.read()) !== null) {
				record = row;
			}
		});

		parser.on("error", reject);
		parser.on("end", () => {
			const headers = Array.isArray(record)
				? record.map((value) => String(value).trim())
				: [];

			resolve(headers);
		});

		parser.write(headerLine);
		parser.end();
	});
}

async function detectDelimiterAndHeaders(headerLine) {
	const commaHeaders = await parseHeaderLineWithDelimiter(headerLine, ",");
	const semicolonHeaders = await parseHeaderLineWithDelimiter(headerLine, ";");

	if (semicolonHeaders.length > commaHeaders.length) {
		return {
			delimiter: ";",
			headers: semicolonHeaders,
		};
	}

	return {
		delimiter: ",",
		headers: commaHeaders,
	};
}


async function readFirstNonEmptyLineAndEncoding(filePath) {
	const stream = fs.createReadStream(filePath);
	const decoder = new StringDecoder("utf8");

	let buffer = "";
	let isFirstChunk = true;
	let encoding = "utf-8";

	for await (const chunk of stream) {
		if (isFirstChunk) {
			isFirstChunk = false;

			if (
				chunk.length >= 3 &&
				chunk[0] === 0xef &&
				chunk[1] === 0xbb &&
				chunk[2] === 0xbf
			) {
				encoding = "utf-8-bom";
			}
		}

		buffer += decoder.write(chunk);

		let extracted = extractLine(buffer);

		while (extracted) {
			const candidate = extracted.line;
			buffer = extracted.rest;

			if (candidate.trim() !== "") {
				stream.destroy();

				return {
					encoding,
					headerLine: candidate,
				};
			}

			extracted = extractLine(buffer);
		}
	}

	buffer += decoder.end();

	if (buffer.trim() !== "") {
		return {
			encoding,
			headerLine: buffer.replace(/\r$/, ""),
		};
	}

	throw new Error("Impossible de détecter l'en-tête du fichier CSV.");
}

async function detectCsvFormat(filePath) {
	if (!filePath) {
		throw new Error("Le fichier CSV est introuvable.");
	}

	try {
		await fsPromises.access(filePath);
	} catch {
		throw new Error("Le fichier CSV est introuvable.");
	}

	const { encoding, headerLine } = await readFirstNonEmptyLineAndEncoding(filePath);
	const { delimiter, headers } = await detectDelimiterAndHeaders(headerLine);

	if (!headers.length || headers.every((header) => !header)) {
		throw new Error("Impossible de détecter l'en-tête du fichier CSV.");
	}

	return {
		encoding,
		delimiter,
		headers,
	};
}

module.exports = {
	detectCsvFormat,
};

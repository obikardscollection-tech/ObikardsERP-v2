const fs = require("fs");
const { parse } = require("csv-parse");

async function* parseCsv(filePath, options) {
	const { delimiter, headers } = options;

	const csvStream = fs.createReadStream(filePath);
	const parser = parse({
		delimiter,
		columns: headers,
		bom: true,
		trim: true,
		relax_quotes: true,
		skip_empty_lines: true,
	});

	try {
		for await (const row of csvStream.pipe(parser)) {
			yield row;
		}
	} finally {
		csvStream.destroy();
		parser.destroy();
	}
}

module.exports = {
	parseCsv,
};

const path = require("path");

const prisma = require("../../lib/prisma");
const {
  createSportsCardsProImport,
} = require("../../modules/market/sportscardspro/sportsCardsProOrchestrator");
const {
  runCsvImportPipeline,
} = require("../inventory/importCsv/pipeline");
const { searchSportsCardsPro } = require("../../modules/market/sportscardspro/sportsCardsProSearchService");
const { getSportsCardsProProduct } = require("../../modules/market/sportscardspro/sportsCardsProProductService");
const { resolveFirstSportsCardsProSearchEntry } = require("../../modules/market/sportscardspro/sportsCardsProSearchResultResolver");
const { mapSportsCardsProSearchResult } = require("../../modules/market/sportscardspro/sportsCardsProSearchResultMapper");
const {
  SPORTS_CARDS_PRO_PROVIDER,
  ERROR_CODES,
} = require("./sportsCardsProConstants");
const {
  resolveFilePath,
  normalizeImportSource,
} = require("./sportsCardsProConfigurationService");
const {
  acquireImportLock,
  releaseImportLockSuccess,
  releaseImportLockFailure,
} = require("./sportsCardsProImportLockService");
const { synchronizeOneRow } = require("./sportsCardsProSyncRowService");
const {
  createStatistics,
  getSportsCardsProSyncStatistics,
} = require("./sportsCardsProStatisticsService");
const { SyncError } = require("./sportsCardsProHelpers");

function coerceString(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized === "" ? null : normalized;
  }

  return String(value);
}

function coerceNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseYearFromDate(value) {
  const text = coerceString(value);

  if (!text) {
    return null;
  }

  const match = text.match(/(\d{4})/);

  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

function resolveProductIdFromEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new SyncError("Aucun resultat SportsCardsPro exploitable n'a ete trouve.", ERROR_CODES.INVALID_ROW);
  }

  const possibleId = entry.id ?? entry["product-id"] ?? entry["productId"];

  if (possibleId !== undefined && possibleId !== null && possibleId !== "") {
    return String(possibleId);
  }

  throw new SyncError("Identifiant produit SportsCardsPro introuvable.", ERROR_CODES.INVALID_ROW);
}

function parseYearFromApiText(value) {
  const text = coerceString(value);

  if (!text) {
    return null;
  }

  const match = text.match(/(\d{4})/);

  if (match) {
    return Number.parseInt(match[1], 10);
  }

  return null;
}

function parsePlayerFromProductName(productName) {
  const text = coerceString(productName);

  if (!text) {
    return null;
  }

  const compact = text.replace(/\s*\[[^\]]+\]/g, "");
  const match = compact.match(/^(.+?)\s*#\d+/);

  if (match && match[1]) {
    return coerceString(match[1]);
  }

  const plain = compact.trim();
  return plain === "" ? null : plain;
}

function parseCardNumberFromProductName(productName) {
  const text = coerceString(productName);

  if (!text) {
    return null;
  }

  const match = text.match(/#(\d+)/);

  return match ? match[1] : null;
}

function parseSportFromText(value) {
  const text = coerceString(value);

  if (!text) {
    return null;
  }

  const normalized = text.toLowerCase();

  if (normalized.includes("basketball")) {
    return "Basketball";
  }

  if (normalized.includes("baseball")) {
    return "Baseball";
  }

  if (normalized.includes("football")) {
    return "Football";
  }

  if (normalized.includes("hockey")) {
    return "Hockey";
  }

  return null;
}

function parseBrandFromConsoleName(consoleName) {
  const text = coerceString(consoleName);

  if (!text) {
    return null;
  }

  const brands = [
    "Topps",
    "Panini",
    "Upper Deck",
    "Bowman",
    "Leaf",
    "Donruss",
    "Fleer",
    "Prizm",
    "Select",
    "Kellogg's",
  ];

  for (const brand of brands) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return null;
}

function parseSetFromConsoleName(consoleName) {
  const text = coerceString(consoleName);

  if (!text) {
    return null;
  }

  const withoutYear = text.replace(/^.*?\b\d{4}\s+/, "");
  const trimmed = coerceString(withoutYear);

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function parseSubsetFromProductName(productName) {
  const text = coerceString(productName);

  if (!text) {
    return null;
  }

  const match = text.match(/\[([^\]]+)\]/);

  return match ? coerceString(match[1]) : null;
}

function buildApiSyncRow(productId, productDetails, searchEntry = null) {
  const source = productDetails && typeof productDetails === "object" ? productDetails : {};
  const fallback = searchEntry && typeof searchEntry === "object" ? searchEntry : {};

  const productName = coerceString(source["product-name"]) || coerceString(fallback["product-name"]) || "UNKNOWN";
  const consoleName = coerceString(source["console-name"]) || coerceString(fallback["console-name"]) || null;
  const releaseDate = coerceString(source["release-date"]) || coerceString(fallback["release-date"]) || null;
  const genre = coerceString(source.genre) || coerceString(fallback.genre) || null;
  const year =
    parseYearFromApiText(consoleName) ??
    parseYearFromApiText(productName) ??
    coerceNumber(source.year) ??
    coerceNumber(fallback.year) ??
    parseYearFromDate(releaseDate) ??
    0;
  const sport =
    parseSportFromText(genre) ||
    parseSportFromText(consoleName) ||
    coerceString(source.sport) ||
    coerceString(fallback.sport) ||
    "UNKNOWN";
  const player =
    parsePlayerFromProductName(productName) ||
    coerceString(source.player) ||
    coerceString(fallback.player) ||
    "UNKNOWN";
  const team = coerceString(source.team) || coerceString(fallback.team) || null;
  const brand =
    parseBrandFromConsoleName(consoleName) ||
    coerceString(source.brand) ||
    coerceString(fallback.brand) ||
    "UNKNOWN";
  const set =
    parseSetFromConsoleName(consoleName) ||
    coerceString(source.set) ||
    coerceString(fallback.set) ||
    "UNKNOWN";
  const league = coerceString(source.league) || coerceString(fallback.league) || null;
  const cardNumber =
    parseCardNumberFromProductName(productName) ||
    coerceString(source["card-number"]) ||
    coerceString(fallback["card-number"]) ||
    null;
  const subset =
    parseSubsetFromProductName(productName) ||
    coerceString(source.subset) ||
    coerceString(fallback.subset) ||
    null;
  const parallel = coerceString(source.parallel) || coerceString(fallback.parallel) || null;
  const variation =
    coerceString(source.variation) ||
    coerceString(fallback.variation) ||
    subset ||
    null;
  const providerUrl = coerceString(source.url) || coerceString(fallback.url) || null;
  const providerUpdatedAt = coerceString(source["updated-at"]) || coerceString(fallback["updated-at"]) || new Date().toISOString();

  return {
    id: String(productId),
    "product-id": String(productId),
    "product-name": productName,
    "console-name": consoleName,
    "release-date": releaseDate,
    year,
    sport,
    player,
    team,
    set,
    brand,
    league,
    "card-number": cardNumber,
    subset,
    parallel,
    variation,
    url: providerUrl,
    "loose-price": coerceNumber(source["loose-price"]) ?? coerceNumber(fallback["loose-price"]) ?? null,
    "graded-price": coerceNumber(source["graded-price"]) ?? coerceNumber(fallback["graded-price"]) ?? null,
    "bgs-10-price": coerceNumber(source["bgs-10-price"]) ?? coerceNumber(fallback["bgs-10-price"]) ?? null,
    "condition-17-price": coerceNumber(source["condition-17-price"]) ?? coerceNumber(fallback["condition-17-price"]) ?? null,
    "condition-18-price": coerceNumber(source["condition-18-price"]) ?? coerceNumber(fallback["condition-18-price"]) ?? null,
    "retail-new-buy": coerceNumber(source["retail-new-buy"]) ?? coerceNumber(fallback["retail-new-buy"]) ?? null,
    "retail-new-sell": coerceNumber(source["retail-new-sell"]) ?? coerceNumber(fallback["retail-new-sell"]) ?? null,
    "retail-loose-buy": coerceNumber(source["retail-loose-buy"]) ?? coerceNumber(fallback["retail-loose-buy"]) ?? null,
    "retail-loose-sell": coerceNumber(source["retail-loose-sell"]) ?? coerceNumber(fallback["retail-loose-sell"]) ?? null,
    "retail-cib-buy": coerceNumber(source["retail-cib-buy"]) ?? coerceNumber(fallback["retail-cib-buy"]) ?? null,
    "retail-cib-sell": coerceNumber(source["retail-cib-sell"]) ?? coerceNumber(fallback["retail-cib-sell"]) ?? null,
    "sales-volume": coerceNumber(source["sales-volume"]) ?? coerceNumber(fallback["sales-volume"]) ?? null,
    "updated-at": providerUpdatedAt,
  };
}

async function resolveSingleApiProduct(input = {}) {
  const source = input || {};

  if (source.searchResult) {
    const productId = resolveProductIdFromEntry(source.searchResult);
    return {
      productId,
      searchEntry: source.searchResult,
    };
  }

  if (source.searchQuery) {
    const searchResponse = await searchSportsCardsPro(source.searchQuery);
    const firstEntry = resolveFirstSportsCardsProSearchEntry(searchResponse);
    const productId = resolveProductIdFromEntry(firstEntry);

    return {
      productId,
      searchEntry: firstEntry,
    };
  }

  if (source.productId !== undefined && source.productId !== null && source.productId !== "") {
    const productIdValue = String(source.productId).trim();

    if (/^\d+$/.test(productIdValue)) {
      return {
        productId: productIdValue,
        searchEntry: null,
      };
    }

    const searchResponse = await searchSportsCardsPro(productIdValue);
    const firstEntry = resolveFirstSportsCardsProSearchEntry(searchResponse);
    const productId = resolveProductIdFromEntry(firstEntry);

    return {
      productId,
      searchEntry: firstEntry,
    };
  }

  throw new SyncError("Aucun identifiant ou resultat de recherche SportsCardsPro n'est fourni.", ERROR_CODES.INVALID_ROW);
}

async function ensureSportsCardsProProvider() {
  const existing = await prisma.marketProvider.findUnique({
    where: {
      code: SPORTS_CARDS_PRO_PROVIDER.CODE,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.marketProvider.create({
    data: {
      code: SPORTS_CARDS_PRO_PROVIDER.CODE,
      name: SPORTS_CARDS_PRO_PROVIDER.NAME,
      type: "BOTH",
      supportsCsv: true,
      supportsApi: true,
      enabled: true,
      priority: 0,
    },
  });
}

async function persistRowErrors(jobId, errorEntries) {
  if (errorEntries.length === 0) {
    return;
  }

  await prisma.marketImportError.createMany({
    data: errorEntries.map((entry) => ({
      marketImportJobId: jobId,
      lineNumber: entry.lineNumber,
      providerCardId: entry.providerCardId,
      field: entry.field,
      errorCode: entry.errorCode,
      message: entry.message,
      rawData: entry.rawData,
    })),
  });
}

async function executeSportsCardsProSync(input = {}) {
  const source = normalizeImportSource(input.source);
  const filePath = resolveFilePath(input.filePath);
  const provider = await ensureSportsCardsProProvider();

  const syncContext = createSportsCardsProImport({
    type: "csv",
    filePath,
  });
  const startedAt = new Date();
  let job = null;

  job = await acquireImportLock({
    providerId: provider.id,
    source,
    fileName: path.basename(filePath),
    startedAt,
  });

  const stats = createStatistics();
  const synchronizedAt = new Date();
  const errorEntries = [];

  try {
    const pipelineContext = await runCsvImportPipeline(syncContext.filePath);
    const normalizedRows =
      pipelineContext &&
      pipelineContext.data &&
      Array.isArray(pipelineContext.data.normalizedRows)
        ? pipelineContext.data.normalizedRows
        : [];

    stats.totalRows = normalizedRows.length;

    for (let index = 0; index < normalizedRows.length; index += 1) {
      const row = normalizedRows[index];

      try {
        await synchronizeOneRow(
          provider.id,
          row,
          stats,
          synchronizedAt
        );
      } catch (error) {
        stats.errorsCount += 1;
        stats.skippedRows += 1;

        errorEntries.push({
          lineNumber: index + 1,
          providerCardId: null,
          field: null,
          errorCode:
            error && error.code
              ? error.code
              : ERROR_CODES.INVALID_ROW,
          message:
            error instanceof Error
              ? error.message
              : "Erreur inconnue pendant la synchronisation.",
          rawData: row,
        });
      }
    }

    await persistRowErrors(job.id, errorEntries);

    const finishedAt = new Date();

    const updatedJob = await releaseImportLockSuccess({
      jobId: job.id,
      startedAt,
      finishedAt,
      stats,
    });

    await prisma.marketProvider.update({
      where: {
        id: provider.id,
      },
      data: {
        lastCsvSync: finishedAt,
      },
    });

    return {
      message: "Synchronisation SportsCardsPro terminee.",
      job: updatedJob,
      statistics: stats,
    };
  } catch (error) {
    const finishedAt = new Date();

    if (job && job.id) {
      await releaseImportLockFailure({
        jobId: job.id,
        startedAt,
        finishedAt,
        stats,
        errorsCount: stats.errorsCount + 1,
      });

      await prisma.marketImportError.create({
        data: {
          marketImportJobId: job.id,
          errorCode:
            error && error.code
              ? error.code
              : ERROR_CODES.JOB_FAILURE,
          message:
            error instanceof Error
              ? error.message
              : "Echec de synchronisation SportsCardsPro.",
        },
      });
    }

    throw error;
  }
}

async function syncSingleSportsCardsProCard(input = {}) {
  const { productId, searchEntry } = await resolveSingleApiProduct(input);
  const productDetails = await getSportsCardsProProduct(productId);

  const provider = await ensureSportsCardsProProvider();
  const synchronizedAt = new Date();
  const stats = createStatistics();
  stats.totalRows = 1;

  const row = buildApiSyncRow(productId, productDetails, searchEntry);
  const result = await synchronizeOneRow(provider.id, row, stats, synchronizedAt);

  const savedProviderCard = await prisma.marketProviderCard.findFirst({
    where: {
      marketProviderId: provider.id,
      providerCardId: productId,
    },
    include: {
      marketCard: true,
    },
  });

  return {
    message: "Carte SportsCardsPro synchronisee avec le moteur Market existant.",
    productId,
    providerId: provider.id,
    providerCard: savedProviderCard,
    statistics: stats,
    synced: result,
  };
}

module.exports = {
  SyncError,
  ensureSportsCardsProProvider,
  executeSportsCardsProSync,
  getSportsCardsProSyncStatistics,
  syncSingleSportsCardsProCard,
};

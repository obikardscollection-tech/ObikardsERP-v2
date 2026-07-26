const inventoryService = require("../inventory");
const customersService = require("../customers");
const suppliersService = require("../suppliers");
const purchasesService = require("../purchases");
const receptionsService = require("../receptions");
const salesService = require("../sales");
const expensesService = require("../expenses");

const CATEGORY_DEFINITIONS = {
  cards: {
    label: "Cartes",
    to: "/inventory",
  },
  clients: {
    label: "Clients",
    to: "/customers",
  },
  suppliers: {
    label: "Fournisseurs",
    to: "/suppliers",
  },
  purchases: {
    label: "Achats",
    to: "/purchases",
  },
  receptions: {
    label: "Receptions",
    to: "/receptions",
  },
  sales: {
    label: "Ventes",
    to: "/sales",
  },
  expenses: {
    label: "Depenses",
    to: "/expenses",
  },
};

const GLOBAL_SEARCH_CATEGORY_ORDER = [
  "cards",
  "clients",
  "suppliers",
  "purchases",
  "receptions",
  "sales",
  "expenses",
];

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function toDateLabel(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("fr-FR");
}

function buildSearchText(parts) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .map((part) => String(part).toLowerCase())
    .join(" ");
}

function createResult(category, id, title, subtitle, meta, searchable) {
  const definition = CATEGORY_DEFINITIONS[category];

  return {
    id: `${category}-${id || title || "unknown"}`,
    category,
    categoryLabel: definition.label,
    title: title || "Sans titre",
    subtitle: subtitle || "",
    meta: meta.filter(Boolean),
    to: definition.to,
    searchable,
  };
}

function mapCard(item) {
  const searchable = buildSearchText([
    item?.sku,
    item?.title,
    item?.player,
    item?.brand,
    item?.sport,
    item?.team,
    item?.series,
    item?.cardNumber,
    item?.status,
    item?.year,
  ]);

  return createResult(
    "cards",
    item?.id,
    item?.title || item?.sku || "Carte",
    [item?.sku, item?.player, item?.brand].filter(Boolean).join(" - "),
    [`Stock: ${Number(item?.quantity || 0)}`, item?.status],
    searchable
  );
}

function mapClient(item) {
  const customerName = [item?.firstName, item?.lastName].filter(Boolean).join(" ").trim();

  const searchable = buildSearchText([
    item?.customerNumber,
    customerName,
    item?.firstName,
    item?.lastName,
    item?.company,
    item?.email,
    item?.phone,
    item?.city,
  ]);

  return createResult(
    "clients",
    item?.id,
    customerName || item?.company || item?.customerNumber || "Client",
    [item?.customerNumber, item?.email].filter(Boolean).join(" - "),
    [item?.phone, item?.city],
    searchable
  );
}

function mapSupplier(item) {
  const searchable = buildSearchText([
    item?.supplierNumber,
    item?.name,
    item?.company,
    item?.email,
    item?.phone,
    item?.city,
  ]);

  return createResult(
    "suppliers",
    item?.id,
    item?.name || item?.company || item?.supplierNumber || "Fournisseur",
    [item?.supplierNumber, item?.email].filter(Boolean).join(" - "),
    [item?.phone, item?.city],
    searchable
  );
}

function mapPurchase(item) {
  const searchable = buildSearchText([
    item?.purchaseNumber,
    item?.status,
    item?.platform,
    item?.supplier?.name,
    item?.supplier?.company,
    item?.notes,
  ]);

  return createResult(
    "purchases",
    item?.id,
    item?.purchaseNumber || "Achat",
    [item?.supplier?.name || item?.supplier?.company, item?.platform].filter(Boolean).join(" - "),
    [
      `Total: ${Number(item?.totalAmount || 0).toFixed(2)} ${item?.currency || "EUR"}`,
      toDateLabel(item?.purchasedAt),
      item?.status,
    ],
    searchable
  );
}

function mapReception(item) {
  const supplier = item?.purchase?.supplier?.name || item?.purchase?.supplier?.company || "";

  const searchable = buildSearchText([
    item?.receptionNumber,
    item?.purchase?.purchaseNumber,
    supplier,
    item?.notes,
  ]);

  return createResult(
    "receptions",
    item?.id,
    item?.receptionNumber || "Reception",
    [item?.purchase?.purchaseNumber, supplier].filter(Boolean).join(" - "),
    [toDateLabel(item?.receivedAt), item?.status],
    searchable
  );
}

function mapSale(item) {
  const customer =
    [item?.customer?.firstName, item?.customer?.lastName].filter(Boolean).join(" ").trim() ||
    item?.customer?.company ||
    item?.customerName ||
    "";

  const searchable = buildSearchText([
    item?.orderNumber,
    customer,
    item?.platform,
    item?.status,
  ]);

  return createResult(
    "sales",
    item?.id,
    item?.orderNumber || "Vente",
    [customer, item?.platform].filter(Boolean).join(" - "),
    [`Total: ${Number(item?.totalAmount || 0).toFixed(2)} EUR`, toDateLabel(item?.soldAt), item?.status],
    searchable
  );
}

function mapExpense(item) {
  const supplier = item?.supplier?.name || item?.supplier?.company || "";

  const searchable = buildSearchText([
    item?.expenseNumber,
    item?.title,
    supplier,
    item?.category,
    item?.paymentMethod,
    item?.paymentStatus,
  ]);

  return createResult(
    "expenses",
    item?.id,
    item?.expenseNumber || item?.title || "Depense",
    [supplier, item?.category].filter(Boolean).join(" - "),
    [`Montant: ${Number(item?.amountTTC || 0).toFixed(2)} EUR`, toDateLabel(item?.expenseDate), item?.paymentStatus],
    searchable
  );
}

const CATEGORY_FETCHERS = {
  cards: async (query, limitPerCategory) => inventoryService.searchInventory(query, limitPerCategory),
  clients: async (query, limitPerCategory) => customersService.searchCustomers(query, limitPerCategory),
  suppliers: async (query, limitPerCategory) => suppliersService.searchSuppliers(query, limitPerCategory),
  purchases: async (query, limitPerCategory) => purchasesService.searchPurchases(query, limitPerCategory),
  receptions: async (query, limitPerCategory) => receptionsService.searchReceptions(query, limitPerCategory),
  sales: async (query, limitPerCategory) => salesService.searchSales(query, limitPerCategory),
  expenses: async (query, limitPerCategory) => expensesService.searchExpenses(query, limitPerCategory),
};

const CATEGORY_MAPPERS = {
  cards: mapCard,
  clients: mapClient,
  suppliers: mapSupplier,
  purchases: mapPurchase,
  receptions: mapReception,
  sales: mapSale,
  expenses: mapExpense,
};

function createEmptyCategories() {
  return GLOBAL_SEARCH_CATEGORY_ORDER.reduce((accumulator, category) => {
    accumulator[category] = [];
    return accumulator;
  }, {});
}

async function fetchCategoryResults(category, query, limitPerCategory) {
  const fetchCategory = CATEGORY_FETCHERS[category];
  const mapper = CATEGORY_MAPPERS[category];

  const list = await fetchCategory(query, limitPerCategory);

  return (Array.isArray(list) ? list : []).map((item) => mapper(item));
}

function parseLimitPerCategory(limitPerCategory) {
  const parsed = Number(limitPerCategory);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 6;
  }

  return Math.floor(parsed);
}

async function searchGlobalEntities(rawQuery, options = {}) {
  const query = normalizeQuery(rawQuery);
  const limitPerCategory = parseLimitPerCategory(options.limitPerCategory);

  if (!query || query.length < 2) {
    return {
      query,
      categories: createEmptyCategories(),
      total: 0,
      categoryLabels: Object.fromEntries(
        GLOBAL_SEARCH_CATEGORY_ORDER.map((category) => [category, CATEGORY_DEFINITIONS[category].label])
      ),
    };
  }

  const settled = await Promise.allSettled(
    GLOBAL_SEARCH_CATEGORY_ORDER.map((category) =>
      fetchCategoryResults(category, query, limitPerCategory)
    )
  );

  const categories = createEmptyCategories();

  settled.forEach((entry, index) => {
    const category = GLOBAL_SEARCH_CATEGORY_ORDER[index];

    if (entry.status === "fulfilled") {
      categories[category] = entry.value;
      return;
    }

    console.error(entry.reason);
    categories[category] = [];
  });

  const total = GLOBAL_SEARCH_CATEGORY_ORDER.reduce(
    (sum, category) => sum + categories[category].length,
    0
  );

  return {
    query,
    total,
    categoryLabels: Object.fromEntries(
      GLOBAL_SEARCH_CATEGORY_ORDER.map((category) => [category, CATEGORY_DEFINITIONS[category].label])
    ),
    categories,
  };
}

module.exports = {
  GLOBAL_SEARCH_CATEGORY_ORDER,
  searchGlobalEntities,
};

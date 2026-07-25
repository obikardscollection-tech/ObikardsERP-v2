import api from "./api";

export const GLOBAL_SEARCH_CATEGORY_ORDER = [
  "cards",
  "clients",
  "suppliers",
  "purchases",
  "receptions",
  "sales",
  "expenses",
];

export async function searchGlobalEntities(rawQuery, options = {}) {
  const limitPerCategory = Number(options.limitPerCategory || 6);
  const { data } = await api.get("/search", {
    params: {
      q: rawQuery,
      limitPerCategory,
    },
  });

  return data;
}

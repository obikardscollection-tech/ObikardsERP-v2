import { getInventoryCategoryLabel, getInventoryStatusLabel } from "../../constants/labels";

export default function InventoryToolbar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
  onReset,
  resultCount,
}) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Filtres et recherche</p>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {resultCount} resultat(s)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <label htmlFor="inventory-search" className="sr-only">
            Rechercher dans l'inventaire
          </label>

          <input
            id="inventory-search"
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un SKU, un joueur, une equipe..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              aria-label="Effacer la recherche"
            >
              Effacer
            </button>
          ) : null}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filtrer par categorie"
        >
          <option value="">Toutes les catégories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {getInventoryCategoryLabel(category)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="IN_STOCK">{getInventoryStatusLabel("IN_STOCK")}</option>
          <option value="SOLD">{getInventoryStatusLabel("SOLD")}</option>
          <option value="RESERVED">{getInventoryStatusLabel("RESERVED")}</option>
        </select>

        <button
          onClick={onReset}
          className="rounded-lg bg-gray-200 px-4 py-3 font-medium transition hover:bg-gray-300"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}
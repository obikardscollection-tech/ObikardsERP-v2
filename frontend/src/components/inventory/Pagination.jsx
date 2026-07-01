export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Afficher
        </span>

        <select
          value={itemsPerPage}
          onChange={(e) =>
            onItemsPerPageChange(Number(e.target.value))
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={999999}>Tous</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border disabled:opacity-40"
        >
          ◀
        </button>

        <span className="font-medium">
          Page {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
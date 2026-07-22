function ReceptionSearch({ value, onChange }) {
  return (
    <div className="w-full">
      <label htmlFor="reception-search" className="sr-only">
        Rechercher une réception
      </label>

      <input
        id="reception-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Recherche réception, achat, fournisseur"
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default ReceptionSearch;

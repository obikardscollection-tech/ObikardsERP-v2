function ExpenseSearch({ value, onChange }) {
  return (
    <div className="w-full md:w-80">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Recherche référence, fournisseur, catégorie"
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default ExpenseSearch;

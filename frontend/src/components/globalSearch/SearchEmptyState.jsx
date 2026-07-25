import { SearchX } from "lucide-react";

function SearchEmptyState({ query = "" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
      <SearchX className="h-6 w-6 text-slate-400" />
      <p className="text-sm font-medium text-slate-700">Aucun resultat trouve</p>
      <p className="text-xs text-slate-500">
        {query
          ? `Aucun element ne correspond a "${query}".`
          : "Saisissez au moins 2 caracteres pour lancer la recherche."}
      </p>
    </div>
  );
}

export default SearchEmptyState;

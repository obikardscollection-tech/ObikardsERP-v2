import { useCallback, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  ChartNoAxesCombined,
  Database,
  ShoppingCart,
  Truck,
  Users,
  Receipt,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import GlobalSearchBar from "../globalSearch/GlobalSearchBar";
import GlobalSearchResults from "../globalSearch/GlobalSearchResults";
import useGlobalSearch from "../../hooks/useGlobalSearch";
import UserSessionPanel from "./UserSessionPanel";

const menu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    icon: Package,
    label: "Inventaire",
    to: "/inventory",
  },
  {
    icon: ChartNoAxesCombined,
    label: "Statistiques",
    to: "/statistics",
  },
  {
    icon: Database,
    label: "SportsCardsPro",
    to: "/sports-cards-pro",
  },
  {
    icon: Users,
    label: "Clients",
    to: "/customers",
  },
  {
    icon: Truck,
    label: "Fournisseurs",
    to: "/suppliers",
  },
  {
    icon: ShoppingCart,
    label: "Achats",
    to: "/purchases",
  },
  {
    icon: Receipt,
    label: "Réceptions",
    to: "/receptions",
  },
  {
    icon: ShoppingCart,
    label: "Ventes",
    to: "/sales",
  },
  {
    icon: Receipt,
    label: "Dépenses",
    to: "/expenses",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const {
    query,
    setQuery,
    resultsByCategory,
    categoryLabels,
    categoryOrder,
    loading,
    error,
    hasSearched,
    totalResults,
    isOpen,
    openSearch,
    closeSearch,
    clearSearch,
    selectedResultId,
    onSearchInputKeyDown,
  } = useGlobalSearch({
    minChars: 2,
    debounceMs: 250,
    limitPerCategory: 5,
  });

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    function handleGlobalSearchShortcut(event) {
      const isShortcut = (event.ctrlKey || event.metaKey)
        && !event.shiftKey
        && !event.altKey
        && event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      openSearch();
      focusSearchInput();
    }

    window.addEventListener("keydown", handleGlobalSearchShortcut);

    return () => {
      window.removeEventListener("keydown", handleGlobalSearchShortcut);
    };
  }, [focusSearchInput, openSearch]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!searchContainerRef.current) {
        return;
      }

      if (!searchContainerRef.current.contains(event.target)) {
        closeSearch();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [closeSearch]);

  useEffect(() => {
    if (!isOpen || !selectedResultId || !searchContainerRef.current) {
      return;
    }

    const escapedId = window.CSS?.escape
      ? window.CSS.escape(selectedResultId)
      : selectedResultId.replaceAll('"', '\\"');

    const selectedElement = searchContainerRef.current.querySelector(
      `[data-search-result-id="${escapedId}"]`
    );

    selectedElement?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [isOpen, selectedResultId]);

  function handleSelectResult(result) {
    navigate(result.to);
    closeSearch();
  }

  function handleSearchKeyDown(event) {
    const resultToOpen = onSearchInputKeyDown(event);

    if (resultToOpen) {
      handleSelectResult(resultToOpen);
    }
  }

  function handleClearSearch() {
    clearSearch();
    closeSearch();
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold tracking-wide">
          OBIKARDS
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          ERP v2
        </p>

        <div className="relative mt-4" ref={searchContainerRef}>
          <GlobalSearchBar
            value={query}
            onChange={setQuery}
            onClear={handleClearSearch}
            onFocus={openSearch}
            onKeyDown={handleSearchKeyDown}
            loading={loading}
            placeholder="Recherche globale..."
            inputRef={searchInputRef}
          />

          {isOpen ? (
            <GlobalSearchResults
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              query={query}
              totalResults={totalResults}
              categoryOrder={categoryOrder}
              categoryLabels={categoryLabels}
              resultsByCategory={resultsByCategory}
              onSelectResult={handleSelectResult}
              selectedResultId={selectedResultId}
            />
          ) : null}
        </div>
      </div>

      <nav className="flex-1 p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3 mb-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <UserSessionPanel />
    </aside>
  );
}

export default Sidebar;
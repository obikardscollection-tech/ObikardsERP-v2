import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GLOBAL_SEARCH_CATEGORY_ORDER,
  searchGlobalEntities,
} from "../services/globalSearchService";

const INITIAL_CATEGORIES = GLOBAL_SEARCH_CATEGORY_ORDER.reduce((accumulator, category) => {
  accumulator[category] = [];
  return accumulator;
}, {});

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export default function useGlobalSearch(options = {}) {
  const minChars = Number(options.minChars || 2);
  const debounceMs = Number(options.debounceMs || 250);
  const limitPerCategory = Number(options.limitPerCategory || 6);

  const [query, setQuery] = useState("");
  const [resultsByCategory, setResultsByCategory] = useState(INITIAL_CATEGORIES);
  const [categoryLabels, setCategoryLabels] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  const totalResults = useMemo(
    () => GLOBAL_SEARCH_CATEGORY_ORDER.reduce((sum, category) => sum + (resultsByCategory[category]?.length || 0), 0),
    [resultsByCategory]
  );

  const flatResults = useMemo(
    () => GLOBAL_SEARCH_CATEGORY_ORDER.flatMap((category) => resultsByCategory[category] || []),
    [resultsByCategory]
  );

  const selectedResult = useMemo(() => {
    if (selectedIndex < 0 || selectedIndex >= flatResults.length) {
      return null;
    }

    return flatResults[selectedIndex];
  }, [flatResults, selectedIndex]);

  const runSearch = useCallback(async (nextQuery) => {
    if (!nextQuery || nextQuery.length < minChars) {
      setResultsByCategory(INITIAL_CATEGORIES);
      setCategoryLabels({});
      setLoading(false);
      setError("");
      setHasSearched(false);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = await searchGlobalEntities(nextQuery, { limitPerCategory });

      setResultsByCategory(payload.categories);
      setCategoryLabels(payload.categoryLabels || {});
      setHasSearched(true);
    } catch (requestError) {
      console.error(requestError);
      setResultsByCategory(INITIAL_CATEGORIES);
      setCategoryLabels({});
      setError(getErrorMessage(requestError, "Impossible de lancer la recherche globale."));
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [limitPerCategory, minChars]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(normalizedQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debounceMs, normalizedQuery, runSearch]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
      return;
    }

    if (flatResults.length === 0) {
      setSelectedIndex(-1);
      return;
    }

    setSelectedIndex((currentIndex) => {
      if (currentIndex >= 0 && currentIndex < flatResults.length) {
        return currentIndex;
      }

      return 0;
    });
  }, [flatResults, isOpen]);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResultsByCategory(INITIAL_CATEGORIES);
    setCategoryLabels({});
    setError("");
    setHasSearched(false);
    setLoading(false);
    setSelectedIndex(-1);
  }, []);

  const moveSelection = useCallback((direction) => {
    if (flatResults.length === 0) {
      return;
    }

    setSelectedIndex((currentIndex) => {
      if (currentIndex < 0) {
        return direction > 0 ? 0 : flatResults.length - 1;
      }

      return (currentIndex + direction + flatResults.length) % flatResults.length;
    });
  }, [flatResults]);

  const onSearchInputKeyDown = useCallback((event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        openSearch();
        moveSelection(1);
        return null;
      case "ArrowUp":
        event.preventDefault();
        openSearch();
        moveSelection(-1);
        return null;
      case "Enter":
        if (!isOpen || !selectedResult) {
          return null;
        }

        event.preventDefault();
        return selectedResult;
      case "Escape":
        event.preventDefault();
        closeSearch();
        return null;
      default:
        return null;
    }
  }, [closeSearch, isOpen, moveSelection, openSearch, selectedResult]);

  return {
    query,
    setQuery,
    resultsByCategory,
    categoryLabels,
    categoryOrder: GLOBAL_SEARCH_CATEGORY_ORDER,
    loading,
    error,
    hasSearched,
    totalResults,
    isOpen,
    openSearch,
    closeSearch,
    clearSearch,
    selectedResultId: selectedResult?.id || null,
    onSearchInputKeyDown,
  };
}

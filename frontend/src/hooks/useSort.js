import { useCallback, useMemo, useState } from "react";

export default function useSort(items) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const collator = useMemo(
    () =>
      new Intl.Collator("fr", {
        sensitivity: "base",
        numeric: true,
      }),
    []
  );

  const sortedItems = useMemo(() => {
    if (!sortField) {
      return items;
    }

    return [...items].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      const numberA = Number(valueA);
      const numberB = Number(valueB);

      const isNumber =
        !Number.isNaN(numberA) &&
        !Number.isNaN(numberB);

      let comparison = 0;

      if (isNumber) {
        comparison = numberA - numberB;
      } else {
        comparison = collator.compare(
          String(valueA ?? ""),
          String(valueB ?? "")
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [collator, items, sortField, sortDirection]);

  const getSortMeta = useCallback((field) => {
    const isActive = sortField === field;

    return {
      isActive,
      direction: isActive ? sortDirection : null,
      ariaSort: isActive
        ? sortDirection === "asc"
          ? "ascending"
          : "descending"
        : "none",
      ariaLabel: isActive
        ? `Trie ${sortDirection === "asc" ? "croissant" : "decroissant"}. Cliquer pour inverser.`
        : "Non trie. Cliquer pour trier.",
    };
  }, [sortDirection, sortField]);

  return {
    sortedItems,
    sortField,
    sortDirection,
    handleSort,
    getSortMeta,
  };
}
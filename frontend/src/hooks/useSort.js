import { useMemo, useState } from "react";

export default function useSort(items) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

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
        comparison = String(valueA ?? "").localeCompare(
          String(valueB ?? ""),
          "fr",
          {
            sensitivity: "base",
            numeric: true,
          }
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [items, sortField, sortDirection]);

  return {
    sortedItems,
    sortField,
    sortDirection,
    handleSort,
  };
}
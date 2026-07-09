import { Plus, Trash2 } from "lucide-react";

const emptyItem = {
  name: "",
  cardReference: "",
  quantity: 1,
  unitPrice: 0,
  condition: "",
  sku: "",
  notes: "",
};

function PurchaseItems({
  items = [],
  onChange,
  readOnly = false,
  errors = {},
}) {
  function updateItem(index, field, value) {
    const nextItems = items.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }

      return {
        ...item,
        [field]: value,
      };
    });

    onChange(nextItems);
  }

  function addItem() {
    onChange([...items, { ...emptyItem }]);
  }

  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Lignes d'achat
        </h3>

        {!readOnly && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        )}
      </div>

      {errors.items && (
        <p className="text-sm text-red-600">
          {errors.items}
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => {
          const lineTotal =
            Number(item.quantity || 0) *
            Number(item.unitPrice || 0);

          return (
            <div
              key={`${item.id ?? "new"}-${index}`}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium text-slate-700">
                  Ligne {index + 1}
                </span>

                {!readOnly && items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer la ligne"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input
                    className="w-full rounded-lg border p-3"
                    name={`name-${index}`}
                    placeholder="Nom"
                    value={item.name}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    disabled={readOnly}
                  />

                  {errors[`items.${index}.name`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`items.${index}.name`]}
                    </p>
                  )}
                </div>

                <input
                  className="w-full rounded-lg border p-3"
                  name={`cardReference-${index}`}
                  placeholder="Reference carte"
                  value={item.cardReference ?? ""}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "cardReference",
                      event.target.value
                    )
                  }
                  disabled={readOnly}
                />

                <div>
                  <input
                    className="w-full rounded-lg border p-3"
                    name={`quantity-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Quantite"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity",
                        event.target.value
                      )
                    }
                    disabled={readOnly}
                  />

                  {errors[`items.${index}.quantity`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`items.${index}.quantity`]}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className="w-full rounded-lg border p-3"
                    name={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Prix unitaire"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "unitPrice",
                        event.target.value
                      )
                    }
                    disabled={readOnly}
                  />

                  {errors[`items.${index}.unitPrice`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`items.${index}.unitPrice`]}
                    </p>
                  )}
                </div>

                <input
                  className="w-full rounded-lg border p-3"
                  name={`condition-${index}`}
                  placeholder="Condition"
                  value={item.condition ?? ""}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "condition",
                      event.target.value
                    )
                  }
                  disabled={readOnly}
                />

                <input
                  className="w-full rounded-lg border p-3"
                  name={`sku-${index}`}
                  placeholder="SKU"
                  value={item.sku ?? ""}
                  onChange={(event) =>
                    updateItem(index, "sku", event.target.value)
                  }
                  disabled={readOnly}
                />
              </div>

              <textarea
                className="mt-4 w-full rounded-lg border p-3"
                rows={2}
                name={`notes-${index}`}
                placeholder="Notes"
                value={item.notes ?? ""}
                onChange={(event) =>
                  updateItem(index, "notes", event.target.value)
                }
                disabled={readOnly}
              />

              <div className="mt-3 text-right text-sm font-medium text-slate-700">
                Total ligne: {lineTotal.toFixed(2)} EUR
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { emptyItem };
export default PurchaseItems;

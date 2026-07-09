import {
  Pencil,
  Trash2,
} from "lucide-react";

function CustomerTable({
  customers = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Référence
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Nom
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Email
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Téléphone
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Ville
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-10 text-center text-slate-500"
              >
                Aucun client.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-t"
              >
                <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                  {customer.customerNumber || "-"}
                </td>

                <td className="px-6 py-4 font-medium">
                  {customer.name}
                </td>

                <td className="px-6 py-4">
                  {customer.email || "-"}
                </td>

                <td className="px-6 py-4">
                  {customer.phone || "-"}
                </td>

                <td className="px-6 py-4">
                  {customer.city || "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(customer)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable;
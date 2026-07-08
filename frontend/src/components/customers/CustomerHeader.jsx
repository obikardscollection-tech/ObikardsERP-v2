import { UserPlus } from "lucide-react";

function CustomerHeader({
  totalCustomers,
  onCreate,
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Clients
        </h1>

        <p className="text-slate-500 mt-1">
          {totalCustomers} client(s)
        </p>
      </div>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        <UserPlus size={20} />
        Ajouter un client
      </button>
    </div>
  );
}

export default CustomerHeader;
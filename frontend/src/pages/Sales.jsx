import Sidebar from "../components/layout/Sidebar";

function Sales() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Ventes</h1>

        <p className="mt-4 text-gray-600">
          Module Ventes en cours de développement.
        </p>
      </main>
    </div>
  );
}

export default Sales;
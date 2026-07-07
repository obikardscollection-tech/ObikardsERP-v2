import Sidebar from "../components/layout/Sidebar";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-2 text-gray-600">
          Bienvenue sur Obikards ERP
        </p>
      </main>
    </div>
  );
}

export default Dashboard;
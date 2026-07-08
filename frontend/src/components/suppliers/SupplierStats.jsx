import {
  Truck,
  BadgeCheck,
  Mail,
  Phone,
} from "lucide-react";

function SupplierStats({ suppliers = [] }) {
  const totalSuppliers = suppliers.length;

  const suppliersWithEmail = suppliers.filter(
    (supplier) => supplier.email
  ).length;

  const suppliersWithPhone = suppliers.filter(
    (supplier) => supplier.phone
  ).length;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.isActive !== false
  ).length;

  const stats = [
    {
      title: "Total fournisseurs",
      value: totalSuppliers,
      icon: Truck,
    },
    {
      title: "Fournisseurs actifs",
      value: activeSuppliers,
      icon: BadgeCheck,
    },
    {
      title: "Avec email",
      value: suppliersWithEmail,
      icon: Mail,
    },
    {
      title: "Avec téléphone",
      value: suppliersWithPhone,
      icon: Phone,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <Icon
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SupplierStats;
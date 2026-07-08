import {
  Users,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";

function CustomerStats({ customers = [] }) {
  const totalCustomers = customers.length;

  const customersWithEmail = customers.filter(
    (customer) => customer.email
  ).length;

  const customersWithPhone = customers.filter(
    (customer) => customer.phone
  ).length;

  const activeCustomers = customers.filter(
    (customer) => customer.isActive !== false
  ).length;

  const stats = [
    {
      title: "Total clients",
      value: totalCustomers,
      icon: Users,
    },
    {
      title: "Clients actifs",
      value: activeCustomers,
      icon: UserCheck,
    },
    {
      title: "Avec email",
      value: customersWithEmail,
      icon: Mail,
    },
    {
      title: "Avec téléphone",
      value: customersWithPhone,
      icon: Phone,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
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

export default CustomerStats;
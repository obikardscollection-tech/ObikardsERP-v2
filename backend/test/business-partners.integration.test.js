const assert = require("node:assert/strict");
const { test } = require("node:test");
const suppliers = require("../src/services/suppliers");
const customers = require("../src/services/customers");
const prisma = require("../src/lib/prisma");
const { uniqueLabel } = require("./erpTestFixtures");

test("Supplier and Customer CRUD regression", async (t) => {
  const supplierIds = [];
  const customerIds = [];

  try {
    await t.test("supplier create, read, search, update, and delete", async () => {
      const marker = uniqueLabel("SUPPLIER");
      const created = await suppliers.createSupplier({
        name: marker,
        company: "Sprint 24",
        email: `${marker.toLowerCase()}@example.test`,
        notes: marker,
      });
      supplierIds.push(created.id);
      assert.match(created.supplierNumber, /^SUP-/);
      assert.equal((await suppliers.getSupplierById(created.id)).id, created.id);
      assert.ok((await suppliers.searchSuppliers(marker, 10)).some(({ id }) => id === created.id));
      const updated = await suppliers.updateSupplier(created.id, { city: "Bruxelles" });
      assert.equal(updated.city, "Bruxelles");
      assert.equal(updated.name, marker);
      await suppliers.deleteSupplier(created.id);
      supplierIds.splice(supplierIds.indexOf(created.id), 1);
      assert.equal(await prisma.supplier.count({ where: { id: created.id } }), 0);
    });

    await t.test("customer create, read, search, update, and delete", async () => {
      const marker = uniqueLabel("CUSTOMER");
      const created = await customers.createCustomer({
        firstName: "Sprint",
        lastName: marker,
        email: `${marker.toLowerCase()}@example.test`,
        notes: marker,
      });
      customerIds.push(created.id);
      assert.match(created.customerNumber, /^CUS-/);
      assert.equal((await customers.getCustomerById(created.id)).id, created.id);
      assert.ok((await customers.searchCustomers(marker, 10)).some(({ id }) => id === created.id));
      const updated = await customers.updateCustomer(created.id, { city: "Namur" });
      assert.equal(updated.city, "Namur");
      assert.equal(updated.lastName, marker);
      await customers.deleteCustomer(created.id);
      customerIds.splice(customerIds.indexOf(created.id), 1);
      assert.equal(await prisma.customer.count({ where: { id: created.id } }), 0);
    });
  } finally {
    await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
    await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
    await prisma.$disconnect();
  }
});
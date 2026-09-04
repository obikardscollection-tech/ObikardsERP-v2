const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const prisma = require("../src/lib/prisma");
const { createApp } = require("../src/app");
const { cookieName } = require("../src/config/authConfig");
const { createSession } = require("../src/services/auth/sessionService");
const { uniqueLabel } = require("./erpTestFixtures");

const app = createApp();

test("Sprint 26 global ERP search", async (t) => {
  const marker = uniqueLabel("GLOBAL_SEARCH");
  const exactSku = `${marker}_SKU_EXACT`;
  const limitedMarker = uniqueLabel("SEARCH_LIMIT");
  const inventoryIds = [];
  const userIds = [];
  let customerId;
  let supplierId;
  let purchaseId;
  let saleId;

  try {
    const [admin, operator] = await Promise.all([
      prisma.user.create({
        data: {
          email: `${marker.toLowerCase()}-admin@example.test`,
          passwordHash: "test-only",
          displayName: "Sprint 26 Admin",
          role: "ADMIN",
        },
      }),
      prisma.user.create({
        data: {
          email: `${marker.toLowerCase()}-operator@example.test`,
          passwordHash: "test-only",
          displayName: "Sprint 26 Operator",
          role: "OPERATOR",
        },
      }),
    ]);
    userIds.push(admin.id, operator.id);

    const [adminSession, operatorSession] = await Promise.all([
      createSession(admin.id),
      createSession(operator.id),
    ]);
    const adminCookie = `${cookieName}=${adminSession.token}`;
    const operatorCookie = `${cookieName}=${operatorSession.token}`;

    const customer = await prisma.customer.create({
      data: {
        customerNumber: `${marker}_CUSTOMER`,
        firstName: marker,
        lastName: "Client",
      },
    });
    customerId = customer.id;

    const supplier = await prisma.supplier.create({
      data: {
        supplierNumber: `${marker}_SUPPLIER`,
        name: `${marker} Supplier`,
      },
    });
    supplierId = supplier.id;

    const inventory = await prisma.inventory.create({
      data: {
        sku: exactSku,
        category: "TEST",
        title: `${marker} Card`,
      },
    });
    inventoryIds.push(inventory.id);

    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber: `${marker}_PURCHASE`,
        supplierId,
        platform: "DIRECT",
      },
    });
    purchaseId = purchase.id;

    const sale = await prisma.sale.create({
      data: {
        orderNumber: `${marker}_SALE`,
        platform: "DIRECT",
        customerId,
      },
    });
    saleId = sale.id;

    const limitedInventory = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        prisma.inventory.create({
          data: {
            sku: `${limitedMarker}_${index}`,
            category: "TEST",
            title: `${limitedMarker} Card ${index}`,
          },
        })
      )
    );
    inventoryIds.push(...limitedInventory.map(({ id }) => id));

    await t.test("anonymous access is refused", async () => {
      const response = await request(app).get("/search").query({ q: marker });
      assert.equal(response.status, 401);
    });

    await t.test("ADMIN and OPERATOR can search", async () => {
      const [adminResponse, operatorResponse] = await Promise.all([
        request(app).get("/search").set("Cookie", adminCookie).query({ q: marker }),
        request(app).get("/search").set("Cookie", operatorCookie).query({ q: marker }),
      ]);
      assert.equal(adminResponse.status, 200);
      assert.equal(operatorResponse.status, 200);
      assert.equal(adminResponse.body.total, operatorResponse.body.total);
    });

    await t.test("an exact business reference returns its entity", async () => {
      const response = await request(app).get("/search").set("Cookie", operatorCookie).query({ q: exactSku });
      assert.equal(response.status, 200);
      assert.equal(response.body.categories.cards.length, 1);
      assert.equal(response.body.categories.cards[0].title, `${marker} Card`);
    });

    await t.test("a partial term returns multiple entity types", async () => {
      const partial = marker.slice(0, -4);
      const response = await request(app).get("/search").set("Cookie", operatorCookie).query({ q: partial });
      assert.equal(response.status, 200);
      for (const category of ["cards", "clients", "suppliers", "purchases", "sales"]) {
        assert.ok(response.body.categories[category].length > 0, category);
      }
    });

    await t.test("an unknown term returns normalized empty categories", async () => {
      const response = await request(app)
        .get("/search")
        .set("Cookie", operatorCookie)
        .query({ q: `${marker}_UNKNOWN` });
      assert.equal(response.status, 200);
      assert.equal(response.body.total, 0);
      assert.ok(Object.values(response.body.categories).every((results) => results.length === 0));
    });

    await t.test("result limits are capped and payloads expose only display fields", async () => {
      const response = await request(app)
        .get("/search")
        .set("Cookie", adminCookie)
        .query({ q: limitedMarker, limitPerCategory: 100000 });
      assert.equal(response.status, 200);
      assert.equal(response.body.categories.cards.length, 10);
      assert.ok(response.body.categories.cards.every((result) => !("searchable" in result)));
    });
  } finally {
    if (saleId) await prisma.sale.deleteMany({ where: { id: saleId } });
    if (purchaseId) await prisma.purchase.deleteMany({ where: { id: purchaseId } });
    await prisma.inventory.deleteMany({ where: { id: { in: inventoryIds } } });
    if (supplierId) await prisma.supplier.deleteMany({ where: { id: supplierId } });
    if (customerId) await prisma.customer.deleteMany({ where: { id: customerId } });
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }
});
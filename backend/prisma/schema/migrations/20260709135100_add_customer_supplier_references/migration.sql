-- AlterTable Customer - Add customerNumber column with temporary default
ALTER TABLE "Customer" ADD COLUMN "customerNumber" TEXT DEFAULT '';

-- AlterTable Supplier - Add supplierNumber column with temporary default
ALTER TABLE "Supplier" ADD COLUMN "supplierNumber" TEXT DEFAULT '';

-- Backfill existing customers with references (starting from CUS-000001)
DO $$
DECLARE
  v_count INTEGER := 1;
  v_customer RECORD;
BEGIN
  FOR v_customer IN 
    SELECT id FROM "Customer" ORDER BY "createdAt" ASC
  LOOP
    UPDATE "Customer" 
    SET "customerNumber" = 'CUS-' || LPAD(v_count::TEXT, 6, '0')
    WHERE id = v_customer.id;
    v_count := v_count + 1;
  END LOOP;
END $$;

-- Backfill existing suppliers with references (starting from SUP-000001)
DO $$
DECLARE
  v_count INTEGER := 1;
  v_supplier RECORD;
BEGIN
  FOR v_supplier IN 
    SELECT id FROM "Supplier" ORDER BY "createdAt" ASC
  LOOP
    UPDATE "Supplier" 
    SET "supplierNumber" = 'SUP-' || LPAD(v_count::TEXT, 6, '0')
    WHERE id = v_supplier.id;
    v_count := v_count + 1;
  END LOOP;
END $$;

-- Set NOT NULL constraint for Customer
ALTER TABLE "Customer" ALTER COLUMN "customerNumber" SET NOT NULL;

-- Set NOT NULL constraint for Supplier
ALTER TABLE "Supplier" ALTER COLUMN "supplierNumber" SET NOT NULL;

-- Create unique constraint for Customer
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerNumber_key" UNIQUE ("customerNumber");

-- Create unique constraint for Supplier
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierNumber_key" UNIQUE ("supplierNumber");

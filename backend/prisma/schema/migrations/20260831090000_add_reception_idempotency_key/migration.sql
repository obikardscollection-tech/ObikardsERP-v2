-- AlterTable
ALTER TABLE "Reception" ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reception_idempotencyKey_key" ON "Reception"("idempotencyKey");
-- Allow multiple SKUs per subscription tier (e.g. 7-day Gold + 30-day Gold).
-- FREE remains constrained to a single row via a partial unique index.

-- DropIndex (was a full unique on code)
DROP INDEX "subscription_plans_code_key";

-- CreateIndex (regular index for lookups by tier)
CREATE INDEX "subscription_plans_code_idx" ON "subscription_plans"("code");

-- CreateIndex (partial unique: only one FREE plan ever)
CREATE UNIQUE INDEX "subscription_plans_code_free_unique"
  ON "subscription_plans"("code")
  WHERE "code" = 'FREE';

-- AlterTable: add price to subscription_plans
ALTER TABLE "subscription_plans"
    ADD COLUMN "price" DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable: singleton app settings (currency lives here)
CREATE TABLE "app_settings" (
    "id"        TEXT NOT NULL DEFAULT 'singleton',
    "currency"  TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton row so GET /settings always returns something.
INSERT INTO "app_settings" ("id", "currency")
VALUES ('singleton', 'USD')
ON CONFLICT ("id") DO NOTHING;

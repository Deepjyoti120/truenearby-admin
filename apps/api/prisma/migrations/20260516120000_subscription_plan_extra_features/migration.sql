-- AlterTable
ALTER TABLE "subscription_plans"
    ADD COLUMN "dailySwipeLimit" INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN "dailySuperLikes" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "monthlyBoosts"   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "canUnblurLikes"  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "canPassport"     BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "hideAds"         BOOLEAN NOT NULL DEFAULT false;

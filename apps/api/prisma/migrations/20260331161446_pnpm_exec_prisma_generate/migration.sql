-- AlterTable
ALTER TABLE "subscription_plans" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_subscriptions" ALTER COLUMN "updatedAt" DROP DEFAULT;

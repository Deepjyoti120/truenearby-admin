-- DropIndex
DROP INDEX "profiles_interests_gin_idx";

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "birthDate" SET DATA TYPE DATE;

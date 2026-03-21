-- DropIndex
DROP INDEX IF EXISTS "profiles_interests_gin_idx";

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "birthDate" SET DATA TYPE DATE;

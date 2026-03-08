/*
  Warnings:

  - The values [MALE,FEMALE,BOTH] on the enum `LookingFor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LookingFor_new" AS ENUM ('LONG_TERM_RELATIONSHIP', 'SERIOUS_DATING', 'MARRIAGE_MINDED', 'CASUAL_DATING', 'NEW_FRIENDS', 'OPEN_TO_ANYTHING');
ALTER TABLE "profiles" ALTER COLUMN "lookingFor" TYPE "LookingFor_new" USING ("lookingFor"::text::"LookingFor_new");
ALTER TYPE "LookingFor" RENAME TO "LookingFor_old";
ALTER TYPE "LookingFor_new" RENAME TO "LookingFor";
DROP TYPE "public"."LookingFor_old";
COMMIT;

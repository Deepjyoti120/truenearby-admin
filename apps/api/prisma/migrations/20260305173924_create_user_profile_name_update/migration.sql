/*
  Warnings:

  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userName]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userName_key" ON "profiles"("userName");

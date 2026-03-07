/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `posts` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "photos_userId_isDeleted_idx";

-- DropIndex
DROP INDEX "posts_userId_isDeleted_createdAt_idx";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "photos_userId_idx" ON "photos"("userId");

-- CreateIndex
CREATE INDEX "posts_userId_createdAt_idx" ON "posts"("userId", "createdAt");

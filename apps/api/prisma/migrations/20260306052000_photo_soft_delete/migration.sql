ALTER TABLE "photos"
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "photos_userId_isDeleted_idx" ON "photos"("userId", "isDeleted");

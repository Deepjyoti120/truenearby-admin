-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "caption" TEXT,
    "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "imageFileIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_userId_isDeleted_createdAt_idx" ON "posts"("userId", "isDeleted", "createdAt");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "latest_user_posts" (
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "postCreatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "latest_user_posts_pkey" PRIMARY KEY ("userId")
);

-- Backfill one latest post per user
INSERT INTO "latest_user_posts" ("userId", "postId", "postCreatedAt", "latitude", "longitude")
SELECT DISTINCT ON (p."userId")
    p."userId",
    p."id",
    p."createdAt",
    p."latitude",
    p."longitude"
FROM "posts" p
ORDER BY p."userId", p."createdAt" DESC, p."id" DESC;

-- CreateIndex
CREATE UNIQUE INDEX "latest_user_posts_postId_key" ON "latest_user_posts"("postId");

-- CreateIndex
CREATE INDEX "latest_user_posts_latitude_longitude_idx" ON "latest_user_posts"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "latest_user_posts_postCreatedAt_postId_idx" ON "latest_user_posts"("postCreatedAt" DESC, "postId" DESC);

-- AddForeignKey
ALTER TABLE "latest_user_posts" ADD CONSTRAINT "latest_user_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latest_user_posts" ADD CONSTRAINT "latest_user_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

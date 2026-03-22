-- CreateIndex
CREATE INDEX "latest_user_posts_postCreatedAt_idx" ON "latest_user_posts"("postCreatedAt" DESC);

-- CreateIndex
CREATE INDEX "latest_user_posts_latitude_longitude_postCreatedAt_idx" ON "latest_user_posts"("latitude", "longitude", "postCreatedAt" DESC);

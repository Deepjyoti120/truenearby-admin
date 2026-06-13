-- Add admin verification + activation flags to posts.
ALTER TABLE "posts"
    ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

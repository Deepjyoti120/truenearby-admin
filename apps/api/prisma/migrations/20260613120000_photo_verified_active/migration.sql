-- Add admin verification + activation flags to photos.
ALTER TABLE "photos"
    ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

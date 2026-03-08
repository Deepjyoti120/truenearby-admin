-- AlterTable
ALTER TABLE "profiles"
ADD COLUMN     "interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "profile_match_preferences" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "maxAge" INTEGER NOT NULL DEFAULT 99,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_match_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profile_match_preferences_age_range_check" CHECK ("minAge" <= "maxAge"),
    CONSTRAINT "profile_match_preferences_age_bounds_check" CHECK ("minAge" >= 18 AND "maxAge" <= 99)
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_match_preferences_profileId_key" ON "profile_match_preferences"("profileId");

-- CreateIndex
CREATE INDEX "profile_match_preferences_minAge_maxAge_idx" ON "profile_match_preferences"("minAge", "maxAge");

-- CreateIndex
CREATE INDEX "profiles_interests_gin_idx" ON "profiles" USING GIN ("interests");

-- AddForeignKey
ALTER TABLE "profile_match_preferences" ADD CONSTRAINT "profile_match_preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

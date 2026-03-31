-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "code" "Plan" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "canReverseLastSwipe" BOOLEAN NOT NULL DEFAULT false,
    "canChangeSwipeDecision" BOOLEAN NOT NULL DEFAULT false,
    "canSeeWhoLikedYou" BOOLEAN NOT NULL DEFAULT false,
    "showLikesInAdvancedHome" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subscriptionPlanId" UUID NOT NULL,
    "plan" "Plan" NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "user_subscriptions_userId_isActive_endAt_idx" ON "user_subscriptions"("userId", "isActive", "endAt");

-- CreateIndex
CREATE INDEX "user_subscriptions_subscriptionPlanId_idx" ON "user_subscriptions"("subscriptionPlanId");

-- SeedPlanCatalog
INSERT INTO "subscription_plans" (
    "id",
    "code",
    "name",
    "description",
    "durationDays",
    "sortOrder",
    "canReverseLastSwipe",
    "canChangeSwipeDecision",
    "canSeeWhoLikedYou",
    "showLikesInAdvancedHome"
)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'FREE',
        'Free',
        'Base plan with standard swiping.',
        30,
        0,
        false,
        false,
        false,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'PLUS',
        'Plus',
        'Includes reverse swipe and swipe decision changes.',
        30,
        1,
        true,
        true,
        false,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'GOLD',
        'Gold',
        'Includes Plus features and shows who liked you in the advanced home.',
        30,
        2,
        true,
        true,
        true,
        true
    );

-- MigrateData
INSERT INTO "user_subscriptions" (
    "id",
    "userId",
    "subscriptionPlanId",
    "plan",
    "startAt",
    "endAt",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    s."id",
    s."userId",
    sp."id",
    s."plan",
    s."startAt",
    s."endAt",
    s."isActive",
    s."createdAt",
    s."createdAt"
FROM "subscriptions" s
JOIN "subscription_plans" sp
    ON sp."code" = s."plan";

-- DropLegacyTable
DROP TABLE "subscriptions";

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

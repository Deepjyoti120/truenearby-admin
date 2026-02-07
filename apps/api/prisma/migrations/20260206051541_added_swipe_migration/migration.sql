-- CreateEnum
CREATE TYPE "SwipeType" AS ENUM ('LIKE', 'PASS');

-- CreateTable
CREATE TABLE "swipes" (
    "id" UUID NOT NULL,
    "fromUserId" UUID NOT NULL,
    "toUserId" UUID NOT NULL,
    "type" "SwipeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "swipes_fromUserId_toUserId_key" ON "swipes"("fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TravelInsight" DROP CONSTRAINT "TravelInsight_categoryId_fkey";

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "TravelInsightCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelInsightCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelInsight" ADD CONSTRAINT "TravelInsight_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TravelInsightCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

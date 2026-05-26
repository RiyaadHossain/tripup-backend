-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TravelInsight"
ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "TravelInsight_categoryId_idx" ON "TravelInsight"("categoryId");

-- AddForeignKey
ALTER TABLE "TravelInsight" ADD CONSTRAINT "TravelInsight_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

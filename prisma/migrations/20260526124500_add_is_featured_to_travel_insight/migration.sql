-- AlterTable
ALTER TABLE "TravelInsight"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "TravelInsight_isFeatured_idx" ON "TravelInsight"("isFeatured");

-- CreateTable
CREATE TABLE "TravelInsight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timeReadMin" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "coverImgUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "insights" TEXT[] NOT NULL,
    "takeAway" TEXT[] NOT NULL,
    "seo" JSONB NOT NULL,
    "tags" TEXT[] NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceToTravelInsight" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToTravelInsight_AB_pkey" PRIMARY KEY ("A", "B")
);

-- CreateIndex
CREATE INDEX "TravelInsight_title_idx" ON "TravelInsight"("title");

-- CreateIndex
CREATE INDEX "TravelInsight_isPublished_idx" ON "TravelInsight"("isPublished");

-- CreateIndex
CREATE INDEX "_ServiceToTravelInsight_B_index" ON "_ServiceToTravelInsight"("B");

-- AddForeignKey
ALTER TABLE "_ServiceToTravelInsight" ADD CONSTRAINT "_ServiceToTravelInsight_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToTravelInsight" ADD CONSTRAINT "_ServiceToTravelInsight_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

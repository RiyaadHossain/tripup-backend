-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bio" TEXT,
    "profileImg" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "facebook" TEXT,
    "email" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "testimony" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userImg" TEXT,
    "designation" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelInsight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timeReadMin" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "coverImgUrl" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "insights" TEXT[],
    "takeAway" TEXT[],
    "seo" JSONB NOT NULL,
    "tags" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelInsightCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelInsightCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "navLinsDesc" TEXT NOT NULL DEFAULT '',
    "icon" TEXT,
    "category" TEXT,
    "comingSoon" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" SERIAL NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "hero" JSONB NOT NULL,
    "problem" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "process" JSONB NOT NULL,
    "deliverables" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "audience" JSONB NOT NULL,
    "whyUs" JSONB NOT NULL,
    "faq" JSONB NOT NULL,
    "cta" JSONB NOT NULL,
    "serviceCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TravelInsightToTravelService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelInsightToTravelService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "TeamMember_name_idx" ON "TeamMember"("name");

-- CreateIndex
CREATE INDEX "TeamMember_isPublished_idx" ON "TeamMember"("isPublished");

-- CreateIndex
CREATE INDEX "Testimonial_userName_idx" ON "Testimonial"("userName");

-- CreateIndex
CREATE INDEX "Testimonial_isPublished_idx" ON "Testimonial"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "TravelInsight_slug_key" ON "TravelInsight"("slug");

-- CreateIndex
CREATE INDEX "TravelInsight_title_idx" ON "TravelInsight"("title");

-- CreateIndex
CREATE INDEX "TravelInsight_categoryId_idx" ON "TravelInsight"("categoryId");

-- CreateIndex
CREATE INDEX "TravelInsight_isFeatured_idx" ON "TravelInsight"("isFeatured");

-- CreateIndex
CREATE INDEX "TravelInsight_isPublished_idx" ON "TravelInsight"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "TravelService_slug_key" ON "TravelService"("slug");

-- CreateIndex
CREATE INDEX "TravelService_title_idx" ON "TravelService"("title");

-- CreateIndex
CREATE INDEX "TravelService_slug_idx" ON "TravelService"("slug");

-- CreateIndex
CREATE INDEX "TravelService_serviceCategoryId_idx" ON "TravelService"("serviceCategoryId");

-- CreateIndex
CREATE INDEX "TravelService_isPublished_idx" ON "TravelService"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE INDEX "_TravelInsightToTravelService_B_index" ON "_TravelInsightToTravelService"("B");

-- AddForeignKey
ALTER TABLE "TravelInsight" ADD CONSTRAINT "TravelInsight_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TravelInsightCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelService" ADD CONSTRAINT "TravelService_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelInsightToTravelService" ADD CONSTRAINT "_TravelInsightToTravelService_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelInsightToTravelService" ADD CONSTRAINT "_TravelInsightToTravelService_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

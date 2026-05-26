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

-- CreateIndex
CREATE INDEX "Testimonial_userName_idx" ON "Testimonial"("userName");

-- CreateIndex
CREATE INDEX "Testimonial_isPublished_idx" ON "Testimonial"("isPublished");

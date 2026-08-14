-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('LOGIN', 'ACCOUNT_CREATED', 'CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'OLD', 'EMAIL_SENT', 'DM', 'COLD_CALL', 'RESPOND', 'IGNORED', 'CONVERT');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'DUE', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_BANKING', 'OTHER');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "addedById" TEXT;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "addedById" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "addedById" TEXT;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "addedById" TEXT,
ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "company" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TravelInsight" ADD COLUMN     "addedById" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "seo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TravelInsightCategory" ADD COLUMN     "addedById" TEXT;

-- AlterTable
ALTER TABLE "TravelService" ADD COLUMN     "addedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addedById" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "readingTime" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL DEFAULT 'View Case Study',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "industryTag" TEXT,
    "coverImage" TEXT,
    "metrics" JSONB,
    "snapshot" JSONB,
    "challenge" JSONB,
    "approachSteps" JSONB NOT NULL,
    "deliverables" TEXT[],
    "transformation" JSONB,
    "results" JSONB,
    "keyTakeaways" TEXT[],
    "testimonial" JSONB,
    "categoryId" TEXT,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "readingTime" TEXT,
    "author" TEXT NOT NULL DEFAULT '',
    "bestFor" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT 'Read Playbook',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "keyTakeaways" TEXT[],
    "whoIsItFor" TEXT[],
    "outcomes" TEXT[],
    "frameworkSteps" JSONB,
    "samplePreviews" JSONB,
    "relatedServices" JSONB,
    "typeId" TEXT,
    "categoryId" TEXT,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaybookCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "niche" TEXT,
    "facebookLink" TEXT,
    "linkedInLink" TEXT,
    "instagramLink" TEXT,
    "twitterLink" TEXT,
    "website" TEXT,
    "contactPerson" TEXT,
    "notes" TEXT,
    "isPotential" BOOLEAN NOT NULL DEFAULT false,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "status" "ExpenseStatus" NOT NULL,
    "expenseDate" DATE NOT NULL,
    "paidBy" VARCHAR(255),
    "vendor" VARCHAR(255),
    "vendorContact" VARCHAR(255),
    "paymentMethod" "PaymentMethod",
    "reference" VARCHAR(255),
    "attachment" JSONB,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "module" TEXT NOT NULL,
    "objectId" TEXT,
    "objectMeta" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- CreateIndex
CREATE INDEX "CaseStudy_title_idx" ON "CaseStudy"("title");

-- CreateIndex
CREATE INDEX "CaseStudy_categoryId_idx" ON "CaseStudy"("categoryId");

-- CreateIndex
CREATE INDEX "CaseStudy_isFeatured_idx" ON "CaseStudy"("isFeatured");

-- CreateIndex
CREATE INDEX "CaseStudy_isPublished_idx" ON "CaseStudy"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Playbook_slug_key" ON "Playbook"("slug");

-- CreateIndex
CREATE INDEX "Playbook_title_idx" ON "Playbook"("title");

-- CreateIndex
CREATE INDEX "Playbook_typeId_idx" ON "Playbook"("typeId");

-- CreateIndex
CREATE INDEX "Playbook_categoryId_idx" ON "Playbook"("categoryId");

-- CreateIndex
CREATE INDEX "Playbook_isFeatured_idx" ON "Playbook"("isFeatured");

-- CreateIndex
CREATE INDEX "Playbook_isPublished_idx" ON "Playbook"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookType_name_key" ON "PlaybookType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookCategory_name_key" ON "PlaybookCategory"("name");

-- CreateIndex
CREATE INDEX "Lead_businessName_idx" ON "Lead"("businessName");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_module_idx" ON "UserActivity"("module");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelInsight" ADD CONSTRAINT "TravelInsight_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelInsightCategory" ADD CONSTRAINT "TravelInsightCategory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelService" ADD CONSTRAINT "TravelService_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CaseStudyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudyCategory" ADD CONSTRAINT "CaseStudyCategory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PlaybookType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PlaybookCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookType" ADD CONSTRAINT "PlaybookType_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookCategory" ADD CONSTRAINT "PlaybookCategory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

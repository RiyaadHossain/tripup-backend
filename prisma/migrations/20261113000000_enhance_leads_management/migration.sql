-- 1. Create LeadStatus_new enum and migrate data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadStatus_new') THEN
    CREATE TYPE "LeadStatus_new" AS ENUM (
      'NEW',
      'OLD',
      'EMAIL_SENT',
      'DM_SENT',
      'COLD_CALL',
      'FOLLOWED_UP',
      'RESPONDED',
      'IGNORED',
      'CONVERTED'
    );
  END IF;
END$$;

ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING (
  CASE "status"::text
    WHEN 'DM' THEN 'DM_SENT'::"LeadStatus_new"
    WHEN 'RESPOND' THEN 'RESPONDED'::"LeadStatus_new"
    WHEN 'CONVERT' THEN 'CONVERTED'::"LeadStatus_new"
    WHEN 'NEW' THEN 'NEW'::"LeadStatus_new"
    WHEN 'OLD' THEN 'OLD'::"LeadStatus_new"
    WHEN 'EMAIL_SENT' THEN 'EMAIL_SENT'::"LeadStatus_new"
    WHEN 'DM_SENT' THEN 'DM_SENT'::"LeadStatus_new"
    WHEN 'COLD_CALL' THEN 'COLD_CALL'::"LeadStatus_new"
    WHEN 'FOLLOWED_UP' THEN 'FOLLOWED_UP'::"LeadStatus_new"
    WHEN 'RESPONDED' THEN 'RESPONDED'::"LeadStatus_new"
    WHEN 'IGNORED' THEN 'IGNORED'::"LeadStatus_new"
    WHEN 'CONVERTED' THEN 'CONVERTED'::"LeadStatus_new"
    ELSE 'NEW'::"LeadStatus_new"
  END
);
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW'::"LeadStatus_new";

DROP TYPE IF EXISTS "LeadStatus";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";

-- 2. Create LeadActivityType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadActivityType') THEN
    CREATE TYPE "LeadActivityType" AS ENUM (
      'LEAD_CREATED',
      'LEAD_ASSIGNED',
      'STATUS_CHANGED',
      'EMAIL_SENT',
      'DM_SENT',
      'COLD_CALL',
      'FOLLOW_UP',
      'MEETING_SCHEDULED',
      'MEETING_COMPLETED',
      'LEAD_RESPONDED',
      'LEAD_IGNORED',
      'LEAD_CONVERTED',
      'LEAD_UPDATED',
      'NOTE_ADDED',
      'OTHER'
    );
  END IF;
END$$;

-- 3. Add new columns to Lead table
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "recommendedOpportunity" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "strength" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualification" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "proposedService" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;

UPDATE "Lead" SET "convertedAt" = "updatedAt" WHERE "status" = 'CONVERTED' AND "convertedAt" IS NULL;
UPDATE "Lead" SET "lastActivityAt" = "updatedAt" WHERE "lastActivityAt" IS NULL;

-- 4. Foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Lead_assignedToId_fkey'
  ) THEN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

-- 5. Create LeadActivity table
CREATE TABLE IF NOT EXISTS "LeadActivity" (
  "id" TEXT NOT NULL,
  "type" "LeadActivityType" NOT NULL,
  "description" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "leadId" TEXT NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LeadActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS "Lead_priority_idx" ON "Lead"("priority");
CREATE INDEX IF NOT EXISTS "Lead_location_idx" ON "Lead"("location");
CREATE INDEX IF NOT EXISTS "Lead_niche_idx" ON "Lead"("niche");
CREATE INDEX IF NOT EXISTS "Lead_addedById_idx" ON "Lead"("addedById");
CREATE INDEX IF NOT EXISTS "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE INDEX IF NOT EXISTS "Lead_lastActivityAt_idx" ON "Lead"("lastActivityAt");
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");

CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");
CREATE INDEX IF NOT EXISTS "LeadActivity_userId_idx" ON "LeadActivity"("userId");
CREATE INDEX IF NOT EXISTS "LeadActivity_type_idx" ON "LeadActivity"("type");
CREATE INDEX IF NOT EXISTS "LeadActivity_createdAt_idx" ON "LeadActivity"("createdAt");


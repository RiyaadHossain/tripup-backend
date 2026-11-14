-- Create competition tables

CREATE TABLE IF NOT EXISTS "competition_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "competition_categories_name_key" UNIQUE ("name")
);

CREATE TABLE IF NOT EXISTS "competition_teams" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "leaderId" TEXT NOT NULL,
  "memberIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "icon" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "annualGoal" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_teams_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "competition_teams_name_key" UNIQUE ("name")
);

CREATE TABLE IF NOT EXISTS "competition_scoring_rules" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "lead" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "conversion" DOUBLE PRECISION NOT NULL DEFAULT 50,
  "consistency" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "contribution" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "target" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "win" DOUBLE PRECISION NOT NULL DEFAULT 200,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_scoring_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competition_challenges" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "cadence" TEXT NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "teamIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "targets" JSONB NOT NULL,
  "rules" JSONB NOT NULL,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "reward" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competition_performances" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "leads" INTEGER NOT NULL DEFAULT 0,
  "converted" INTEGER NOT NULL DEFAULT 0,
  "consistency" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tasks" INTEGER NOT NULL DEFAULT 0,
  "isManual" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_performances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "competition_performances_employeeId_month_key" UNIQUE ("employeeId", "month")
);

CREATE TABLE IF NOT EXISTS "competition_badges" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "target" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competition_achievements" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "description" TEXT,
  "badgeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competition_milestones" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metric" TEXT NOT NULL,
  "target" DOUBLE PRECISION NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_milestones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competition_monthly_winners" (
  "id" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "team" JSONB,
  "individual" JSONB,
  "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "competition_monthly_winners_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "competition_monthly_winners_month_key" UNIQUE ("month")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "competition_teams_active_idx" ON "competition_teams"("active");
CREATE INDEX IF NOT EXISTS "competition_teams_category_idx" ON "competition_teams"("category");
CREATE INDEX IF NOT EXISTS "competition_challenges_archived_idx" ON "competition_challenges"("archived");
CREATE INDEX IF NOT EXISTS "competition_challenges_active_idx" ON "competition_challenges"("active");
CREATE INDEX IF NOT EXISTS "competition_performances_month_idx" ON "competition_performances"("month");
CREATE INDEX IF NOT EXISTS "competition_performances_employeeId_idx" ON "competition_performances"("employeeId");
CREATE INDEX IF NOT EXISTS "competition_achievements_recipientId_idx" ON "competition_achievements"("recipientId");
CREATE INDEX IF NOT EXISTS "competition_achievements_date_idx" ON "competition_achievements"("date");
CREATE INDEX IF NOT EXISTS "competition_milestones_active_idx" ON "competition_milestones"("active");

-- Insert competition permissions into Permission table
INSERT INTO "Permission" ("id", "module", "action", "createdAt")
VALUES
  (gen_random_uuid(), 'competition', 'READ', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'competition', 'CREATE', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'competition', 'UPDATE', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'competition', 'DELETE', CURRENT_TIMESTAMP)
ON CONFLICT ("module", "action") DO NOTHING;

-- Assign new competition permissions to Super Admin role
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r."name" = 'Super Admin' AND p."module" = 'competition'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;


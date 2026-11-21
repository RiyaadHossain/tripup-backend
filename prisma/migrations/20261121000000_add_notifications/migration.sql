-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'TASK_ASSIGNED',
      'TASK_UPDATED',
      'TASK_STATUS_CHANGED',
      'TASK_DELETED',
      'LEAD_ASSIGNED',
      'LEAD_CREATED',
      'LEAD_UPDATED',
      'LEAD_STATUS_CHANGED',
      'LEAD_DELETED',
      'MONTHLY_REPORT',
      'GENERAL'
    );
  END IF;
END$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
  "module" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  "triggeredById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notifications_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "notifications_module_idx" ON "notifications"("module");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");

-- Insert notifications permissions into Permission table
INSERT INTO "Permission" ("id", "module", "action", "createdAt")
VALUES
  (gen_random_uuid(), 'notifications', 'READ', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'notifications', 'CREATE', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'notifications', 'UPDATE', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'notifications', 'DELETE', CURRENT_TIMESTAMP)
ON CONFLICT ("module", "action") DO NOTHING;

-- Assign new notifications permissions to Super Admin role
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r."name" = 'Super Admin' AND p."module" = 'notifications'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

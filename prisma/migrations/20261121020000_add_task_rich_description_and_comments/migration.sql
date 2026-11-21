-- AlterTable
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "descriptionFormat" TEXT NOT NULL DEFAULT 'plain';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "mentionedUserIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_comments" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "contentFormat" TEXT NOT NULL DEFAULT 'html',
  "mentions" JSONB DEFAULT '[]',
  "mentionedUserIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "taskId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "task_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_comments_taskId_idx" ON "task_comments"("taskId");
CREATE INDEX IF NOT EXISTS "task_comments_taskId_createdAt_idx" ON "task_comments"("taskId", "createdAt");
CREATE INDEX IF NOT EXISTS "task_comments_authorId_idx" ON "task_comments"("authorId");

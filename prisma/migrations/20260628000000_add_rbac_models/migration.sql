-- Migration: add_rbac_models
-- Adds User, Role, Permission, RolePermission models and PermissionAction enum
-- Applied via: prisma db push (due to schema drift from untracked migrations)
-- For clean environments, run: prisma migrate dev --name add_rbac_models

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE');

-- CreateTable: Role
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Permission
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RolePermission (join table)
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Role name must be unique
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex: User email must be unique
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex: Permission [module, action] unique constraint
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex: Lookup indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- AddForeignKey: User -> Role
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: RolePermission -> Role (cascade delete)
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: RolePermission -> Permission (cascade delete)
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES "Permission"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `image` on the `TeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
CREATE SEQUENCE teammember_displayorder_seq;
ALTER TABLE "TeamMember" DROP COLUMN "image",
ADD COLUMN     "profileImg" TEXT,
ALTER COLUMN "displayOrder" SET DEFAULT nextval('teammember_displayorder_seq');
ALTER SEQUENCE teammember_displayorder_seq OWNED BY "TeamMember"."displayOrder";

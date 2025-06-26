-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GroupMembership" ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "is_active" INTEGER NOT NULL DEFAULT 1;

/*
  Warnings:

  - You are about to drop the column `message_type` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "message_type",
ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "is_file" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_text" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "MessageType";

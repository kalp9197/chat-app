/*
  Warnings:

  - You are about to drop the column `is_file` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `is_text` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'file');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "is_file",
DROP COLUMN "is_text",
ADD COLUMN     "message_type" "MessageType" NOT NULL DEFAULT 'text';

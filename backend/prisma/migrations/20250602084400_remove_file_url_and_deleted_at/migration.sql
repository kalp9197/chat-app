/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `DirectMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DirectMessage` DROP COLUMN `deleted_at`,
    DROP COLUMN `file_url`;

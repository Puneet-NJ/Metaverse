/*
  Warnings:

  - Made the column `height` on table `Space` required. This step will fail if there are existing NULL values in that column.
  - Made the column `width` on table `Space` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "width" SET NOT NULL;
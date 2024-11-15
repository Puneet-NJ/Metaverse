/*
  Warnings:

  - You are about to drop the column `mapId` on the `Space` table. All the data in the column will be lost.
  - Added the required column `name` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_mapId_fkey";

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "mapId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL;

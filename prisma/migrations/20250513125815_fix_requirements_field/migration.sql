/*
  Warnings:

  - You are about to drop the column `requerements` on the `Opportunity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "requerements",
ADD COLUMN     "requirements" TEXT;

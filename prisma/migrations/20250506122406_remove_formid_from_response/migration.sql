/*
  Warnings:

  - You are about to drop the column `formId` on the `Response` table. All the data in the column will be lost.
  - Made the column `opportunityId` on table `Response` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_formId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_opportunityId_fkey";

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "formId",
ALTER COLUMN "opportunityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

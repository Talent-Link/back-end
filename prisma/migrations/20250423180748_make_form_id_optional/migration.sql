-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_formId_fkey";

-- AlterTable
ALTER TABLE "Opportunity" ALTER COLUMN "formId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

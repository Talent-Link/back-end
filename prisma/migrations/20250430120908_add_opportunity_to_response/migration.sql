-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "opportunityId" TEXT;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

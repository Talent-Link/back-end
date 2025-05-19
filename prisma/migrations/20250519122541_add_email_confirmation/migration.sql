-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConfirmationToken" TEXT,
ADD COLUMN     "isEmailConfirmed" BOOLEAN NOT NULL DEFAULT false;

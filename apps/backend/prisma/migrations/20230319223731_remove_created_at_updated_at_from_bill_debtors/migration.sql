/*
  Warnings:

  - You are about to drop the column `createdAt` on the `bill_debtors` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bill_debtors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bill_debtors" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

/*
  Warnings:

  - You are about to drop the column `discountEndDate` on the `ProductPricing` table. All the data in the column will be lost.
  - You are about to drop the column `discountStartDate` on the `ProductPricing` table. All the data in the column will be lost.
  - You are about to drop the column `discountedSellingPrice` on the `ProductPricing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductPricing" DROP COLUMN "discountEndDate",
DROP COLUMN "discountStartDate",
DROP COLUMN "discountedSellingPrice";

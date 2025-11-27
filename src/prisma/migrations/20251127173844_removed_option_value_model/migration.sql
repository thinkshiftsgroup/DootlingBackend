/*
  Warnings:

  - You are about to drop the `ProductOptionValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductOptionValue" DROP CONSTRAINT "ProductOptionValue_productOptionId_fkey";

-- AlterTable
ALTER TABLE "ProductOption" ADD COLUMN     "values" TEXT[];

-- DropTable
DROP TABLE "ProductOptionValue";

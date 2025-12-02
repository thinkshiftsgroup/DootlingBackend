-- AlterTable
ALTER TABLE "ProductPricing" ADD COLUMN     "discountEndDate" TIMESTAMP(3),
ADD COLUMN     "discountStartDate" TIMESTAMP(3),
ADD COLUMN     "discountedSellingPrice" DOUBLE PRECISION;

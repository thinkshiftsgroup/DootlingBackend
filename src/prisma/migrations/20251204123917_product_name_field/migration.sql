-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "affilated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brands" TEXT[],
ADD COLUMN     "embedVideoPlatform" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "sizeChartImageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductPricing" ADD COLUMN     "costPrice" DOUBLE PRECISION;

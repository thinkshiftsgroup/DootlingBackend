-- AlterTable
ALTER TABLE "ProductVariantOption" ADD COLUMN "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "affectsPrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "additionalPrice" DOUBLE PRECISION DEFAULT 0;

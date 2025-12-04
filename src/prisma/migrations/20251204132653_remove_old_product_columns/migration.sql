-- AlterTable
ALTER TABLE "Product" DROP COLUMN IF EXISTS "affilated",
DROP COLUMN IF EXISTS "brands",
DROP COLUMN IF EXISTS "embedVideoPlatform",
DROP COLUMN IF EXISTS "location";

-- AlterTable
ALTER TABLE "ProductPricing" DROP COLUMN IF EXISTS "costPrice";

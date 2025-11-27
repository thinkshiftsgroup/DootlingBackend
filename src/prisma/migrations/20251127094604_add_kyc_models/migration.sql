-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycDocumentType" AS ENUM ('GOVERNMENT_ID', 'INCORPORATION_CERTIFICATE', 'ARTICLE_OF_ASSOCIATION', 'PROOF_OF_ADDRESS', 'SELFIE_WITH_ID', 'BANK_STATEMENT', 'ADDITIONAL');

-- CreateTable
CREATE TABLE "UserKycProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "middleName" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "meansOfIdentification" TEXT,
    "identificationNumber" TEXT,
    "identificationExpiry" TIMESTAMP(3),
    "countryOfResidency" TEXT,
    "contactAddress" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKycProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessKyc" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "companyType" TEXT,
    "incorporationNumber" TEXT,
    "dateOfIncorporation" TIMESTAMP(3),
    "countryOfIncorporation" TEXT,
    "taxNumber" TEXT,
    "companyAddress" TEXT,
    "zipOrPostcode" TEXT,
    "stateOrProvince" TEXT,
    "city" TEXT,
    "businessDescription" TEXT,
    "companyWebsite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessKyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "KycDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserKycProfile_userId_key" ON "UserKycProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessKyc_userId_key" ON "BusinessKyc"("userId");

-- AddForeignKey
ALTER TABLE "UserKycProfile" ADD CONSTRAINT "UserKycProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessKyc" ADD CONSTRAINT "BusinessKyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

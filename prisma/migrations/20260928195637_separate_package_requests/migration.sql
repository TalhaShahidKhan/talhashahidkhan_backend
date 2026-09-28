/*
  Warnings:

  - You are about to drop the column `packageId` on the `service_requests` table. All the data in the column will be lost.
  - You are about to drop the `_ServiceToServicePackage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ServiceToServicePackage" DROP CONSTRAINT "_ServiceToServicePackage_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToServicePackage" DROP CONSTRAINT "_ServiceToServicePackage_B_fkey";

-- DropForeignKey
ALTER TABLE "service_requests" DROP CONSTRAINT "service_requests_packageId_fkey";

-- DropIndex
DROP INDEX "service_requests_packageId_idx";

-- AlterTable
ALTER TABLE "service_requests" DROP COLUMN "packageId";

-- DropTable
DROP TABLE "_ServiceToServicePackage";

-- CreateTable
CREATE TABLE "service_package_requests" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "message" TEXT,
    "additionalRequirements" TEXT[],
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_package_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_package_requests_status_createdAt_idx" ON "service_package_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "service_package_requests_packageId_idx" ON "service_package_requests"("packageId");

-- AddForeignKey
ALTER TABLE "service_package_requests" ADD CONSTRAINT "service_package_requests_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "service_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

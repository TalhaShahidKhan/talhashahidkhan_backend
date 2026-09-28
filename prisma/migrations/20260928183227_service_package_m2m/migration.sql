/*
  Warnings:

  - You are about to drop the column `serviceId` on the `service_packages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "service_packages" DROP CONSTRAINT "service_packages_serviceId_fkey";

-- DropIndex
DROP INDEX "service_packages_serviceId_status_idx";

-- AlterTable
ALTER TABLE "service_packages" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "_ServiceToServicePackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToServicePackage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceToServicePackage_B_index" ON "_ServiceToServicePackage"("B");

-- CreateIndex
CREATE INDEX "service_packages_status_idx" ON "service_packages"("status");

-- AddForeignKey
ALTER TABLE "_ServiceToServicePackage" ADD CONSTRAINT "_ServiceToServicePackage_A_fkey" FOREIGN KEY ("A") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToServicePackage" ADD CONSTRAINT "_ServiceToServicePackage_B_fkey" FOREIGN KEY ("B") REFERENCES "service_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

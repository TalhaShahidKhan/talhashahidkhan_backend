/*
  Warnings:

  - A unique constraint covering the columns `[route,ipAddress]` on the table `frontend_page_analytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,ipAddress]` on the table `post_analytics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ipAddress` to the `frontend_page_analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipAddress` to the `post_analytics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "frontend_page_analytics" ADD COLUMN     "ipAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "post_analytics" ADD COLUMN     "ipAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "frontend_page_analytics_route_ipAddress_key" ON "frontend_page_analytics"("route", "ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "post_analytics_postId_ipAddress_key" ON "post_analytics"("postId", "ipAddress");

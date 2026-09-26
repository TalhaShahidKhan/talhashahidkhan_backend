-- CreateTable
CREATE TABLE "post_analytics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frontend_page_analytics" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frontend_page_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_analytics_postId_idx" ON "post_analytics"("postId");

-- CreateIndex
CREATE INDEX "frontend_page_analytics_pageUrl_idx" ON "frontend_page_analytics"("pageUrl");

-- AddForeignKey
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

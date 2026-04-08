-- CreateEnum
CREATE TYPE "SiteRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('active', 'suspended');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supertokensUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "siteKey" TEXT NOT NULL,
    "primaryDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSiteRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "role" "SiteRole" NOT NULL DEFAULT 'user',
    "status" "AccessStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSiteRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supertokensUserId_key" ON "User"("supertokensUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_siteKey_key" ON "Site"("siteKey");

-- CreateIndex
CREATE UNIQUE INDEX "Site_primaryDomain_key" ON "Site"("primaryDomain");

-- CreateIndex
CREATE INDEX "SiteProfile_siteId_idx" ON "SiteProfile"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteProfile_userId_siteId_key" ON "SiteProfile"("userId", "siteId");

-- CreateIndex
CREATE INDEX "UserSiteRole_siteId_role_idx" ON "UserSiteRole"("siteId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserSiteRole_userId_siteId_key" ON "UserSiteRole"("userId", "siteId");

-- AddForeignKey
ALTER TABLE "SiteProfile" ADD CONSTRAINT "SiteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteProfile" ADD CONSTRAINT "SiteProfile_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSiteRole" ADD CONSTRAINT "UserSiteRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSiteRole" ADD CONSTRAINT "UserSiteRole_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

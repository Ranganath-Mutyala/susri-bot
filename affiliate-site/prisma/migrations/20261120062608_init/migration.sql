-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'ClearCompare',
    "tagline" TEXT NOT NULL DEFAULT 'Independent comparisons for smarter decisions',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "footerText" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "contactAddress" TEXT NOT NULL DEFAULT '',
    "globalPixel" TEXT NOT NULL DEFAULT '',
    "headScripts" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metaTitle" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "offerName" TEXT NOT NULL DEFAULT '',
    "ctaUrl" TEXT NOT NULL DEFAULT '',
    "pixelScript" TEXT NOT NULL DEFAULT '',
    "pixelPlacement" TEXT NOT NULL DEFAULT 'head',
    "passthroughParams" BOOLEAN NOT NULL DEFAULT true,
    "payout" REAL NOT NULL DEFAULT 0,
    "geos" TEXT NOT NULL DEFAULT '[]',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "badgeText" TEXT NOT NULL DEFAULT '',
    "headline" TEXT NOT NULL DEFAULT '',
    "subheadline" TEXT NOT NULL DEFAULT '',
    "heroBullets" TEXT NOT NULL DEFAULT '[]',
    "ctaText" TEXT NOT NULL DEFAULT 'Check Availability',
    "ctaSubtext" TEXT NOT NULL DEFAULT '',
    "comparisonTitle" TEXT NOT NULL DEFAULT '',
    "comparisonColumns" TEXT NOT NULL DEFAULT '[]',
    "comparisonRows" TEXT NOT NULL DEFAULT '[]',
    "body" TEXT NOT NULL DEFAULT '',
    "pros" TEXT NOT NULL DEFAULT '[]',
    "cons" TEXT NOT NULL DEFAULT '[]',
    "verdict" TEXT NOT NULL DEFAULT '',
    "showComparison" BOOLEAN NOT NULL DEFAULT true,
    "showEmailCapture" BOOLEAN NOT NULL DEFAULT false,
    "showStickyCta" BOOLEAN NOT NULL DEFAULT true,
    "emailHeadline" TEXT NOT NULL DEFAULT 'Get our free buyer''s checklist',
    "emailSubtext" TEXT NOT NULL DEFAULT 'One useful email. No spam. Unsubscribe anytime.',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "metaTitle" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "authorName" TEXT NOT NULL DEFAULT 'Editorial Team',
    "authorRole" TEXT NOT NULL DEFAULT '',
    "authorBio" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "sourceSlug" TEXT NOT NULL,
    "landingPageId" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "LandingPage_category_status_idx" ON "LandingPage"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_category_status_idx" ON "Article"("category", "status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_sourceSlug_key" ON "Lead"("email", "sourceSlug");

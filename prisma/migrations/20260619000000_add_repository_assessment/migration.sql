-- CreateTable: RepositoryAssessment
CREATE TABLE "RepositoryAssessment" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "documentUploadId" TEXT,
    "repositoryName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "azureReadinessScore" INTEGER,
    "detectedStack" TEXT,
    "runtime" TEXT,
    "packageManager" TEXT,
    "buildCommand" TEXT,
    "startCommand" TEXT,
    "appType" TEXT,
    "envVariablesJson" TEXT,
    "azureServicesJson" TEXT,
    "installStepsJson" TEXT,
    "risksJson" TEXT,
    "recommendationsJson" TEXT,
    "adminDocumentMarkdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryAssessment_documentUploadId_key" ON "RepositoryAssessment"("documentUploadId");

-- CreateIndex
CREATE INDEX "RepositoryAssessment_clientBlueprintId_idx" ON "RepositoryAssessment"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "RepositoryAssessment" ADD CONSTRAINT "RepositoryAssessment_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryAssessment" ADD CONSTRAINT "RepositoryAssessment_documentUploadId_fkey" FOREIGN KEY ("documentUploadId") REFERENCES "DocumentUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

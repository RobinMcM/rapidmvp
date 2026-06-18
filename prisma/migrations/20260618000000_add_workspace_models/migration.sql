-- CreateTable: Lead
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectType" TEXT,
    "teamSize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClientProfile
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ClientBlueprint
CREATE TABLE "ClientBlueprint" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientBlueprint_clientId_idx" ON "ClientBlueprint"("clientId");

-- AddForeignKey
ALTER TABLE "ClientBlueprint" ADD CONSTRAINT "ClientBlueprint_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: VisionWorkflow
CREATE TABLE "VisionWorkflow" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "businessGoal" TEXT,
    "targetUsers" TEXT,
    "currentPlatform" TEXT,
    "expectedGrowth" TEXT,
    "integrations" TEXT,
    "securityRequirements" TEXT,
    "complianceRequirements" TEXT,
    "preferredCloud" TEXT,
    "aiRequirements" TEXT,
    "teamCapability" TEXT,
    "generatedSummary" TEXT,
    "recommendedBlueprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisionWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisionWorkflow_clientBlueprintId_key" ON "VisionWorkflow"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "VisionWorkflow" ADD CONSTRAINT "VisionWorkflow_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: BuildAssessment
CREATE TABLE "BuildAssessment" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "description" TEXT,
    "tasksJson" TEXT,
    "validationJson" TEXT,
    "evidenceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildAssessment_clientBlueprintId_idx" ON "BuildAssessment"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "BuildAssessment" ADD CONSTRAINT "BuildAssessment_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: CostEstimate
CREATE TABLE "CostEstimate" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "costLevel" TEXT,
    "costDriver" TEXT,
    "notes" TEXT,
    "optimisation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostEstimate_clientBlueprintId_idx" ON "CostEstimate"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: RiskItem
CREATE TABLE "RiskItem" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT,
    "likelihood" TEXT,
    "mitigation" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiskItem_clientBlueprintId_idx" ON "RiskItem"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "RiskItem" ADD CONSTRAINT "RiskItem_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: BuildScript
CREATE TABLE "BuildScript" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "scriptType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "explanation" TEXT,
    "requiredSecrets" TEXT,
    "validationSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildScript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildScript_clientBlueprintId_idx" ON "BuildScript"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "BuildScript" ADD CONSTRAINT "BuildScript_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DocumentUpload
CREATE TABLE "DocumentUpload" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "spacesKey" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "parseStatus" TEXT NOT NULL DEFAULT 'pending',
    "parsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentUpload_clientBlueprintId_idx" ON "DocumentUpload"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "DocumentUpload" ADD CONSTRAINT "DocumentUpload_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DocumentFinding
CREATE TABLE "DocumentFinding" (
    "id" TEXT NOT NULL,
    "documentUploadId" TEXT NOT NULL,
    "findingType" TEXT NOT NULL,
    "key" TEXT,
    "value" TEXT,
    "contextJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentFinding_documentUploadId_idx" ON "DocumentFinding"("documentUploadId");

-- AddForeignKey
ALTER TABLE "DocumentFinding" ADD CONSTRAINT "DocumentFinding_documentUploadId_fkey" FOREIGN KEY ("documentUploadId") REFERENCES "DocumentUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ArchitectureFinding
CREATE TABLE "ArchitectureFinding" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "documentUploadId" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "recommendation" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchitectureFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchitectureFinding_clientBlueprintId_idx" ON "ArchitectureFinding"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "ArchitectureFinding" ADD CONSTRAINT "ArchitectureFinding_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureFinding" ADD CONSTRAINT "ArchitectureFinding_documentUploadId_fkey" FOREIGN KEY ("documentUploadId") REFERENCES "DocumentUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: AcceptanceReport
CREATE TABLE "AcceptanceReport" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "categoriesJson" TEXT NOT NULL,
    "aiSummary" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcceptanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcceptanceReport_clientBlueprintId_key" ON "AcceptanceReport"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "AcceptanceReport" ADD CONSTRAINT "AcceptanceReport_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: EvidenceItem
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "documentUploadId" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceItem_assessmentId_idx" ON "EvidenceItem"("assessmentId");

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "BuildAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_documentUploadId_fkey" FOREIGN KEY ("documentUploadId") REFERENCES "DocumentUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: FinancialAssessment
CREATE TABLE "FinancialAssessment" (
    "id" TEXT NOT NULL,
    "clientBlueprintId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "leakageItemsJson" TEXT NOT NULL,
    "riskDecisionJson" TEXT NOT NULL,
    "aiSummary" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAssessment_clientBlueprintId_key" ON "FinancialAssessment"("clientBlueprintId");

-- AddForeignKey
ALTER TABLE "FinancialAssessment" ADD CONSTRAINT "FinancialAssessment_clientBlueprintId_fkey" FOREIGN KEY ("clientBlueprintId") REFERENCES "ClientBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

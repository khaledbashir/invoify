-- REQ-114, REQ-125, REQ-126: Add lifecycle, verification, and financial override fields

-- Add structural tonnage fields (REQ-86)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "structuralTonnage" DECIMAL(65,30);
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "reinforcingTonnage" DECIMAL(65,30);

-- Add lifecycle/immutability fields (REQ-114)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "lockedAt" TIMESTAMP(3);
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "documentHash" TEXT;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "parentProposalId" TEXT;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "versionNumber" INTEGER NOT NULL DEFAULT 1;

-- Add verification fields
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "verificationManifest" JSONB;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "reconciliationReport" JSONB;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3);

-- Add AI verification state persistence (REQ-126)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "aiFilledFields" JSONB;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "verifiedFields" JSONB;

-- Add financial override fields (REQ-125)
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "taxRateOverride" DECIMAL(65,30);
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "bondRateOverride" DECIMAL(65,30);
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "shareHash" TEXT;

-- Add unique constraint on shareHash if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Proposal_shareHash_key'
    ) THEN
        ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_shareHash_key" UNIQUE ("shareHash");
    END IF;
END $$;

-- Add role field to User model (REQ-120)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'VIEWER';

-- Create SignatureAuditTrail table if not exists (REQ-114)
CREATE TABLE IF NOT EXISTS "SignatureAuditTrail" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerTitle" TEXT,
    "signerRole" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "authMethod" TEXT NOT NULL,
    "documentHash" TEXT NOT NULL,
    "pdfHash" TEXT,
    "auditExcelHash" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignatureAuditTrail_pkey" PRIMARY KEY ("id")
);

-- Create index on SignatureAuditTrail
CREATE INDEX IF NOT EXISTS "SignatureAuditTrail_proposalId_idx" ON "SignatureAuditTrail"("proposalId");

-- Add foreign key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SignatureAuditTrail_proposalId_fkey'
    ) THEN
        ALTER TABLE "SignatureAuditTrail" ADD CONSTRAINT "SignatureAuditTrail_proposalId_fkey" 
        FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create ManualOverride table if not exists
CREATE TABLE IF NOT EXISTS "ManualOverride" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "originalValue" JSONB,
    "overrideValue" JSONB NOT NULL,
    "reason" TEXT,
    "overriddenBy" TEXT NOT NULL,
    "overriddenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualOverride_pkey" PRIMARY KEY ("id")
);

-- Create index on ManualOverride
CREATE INDEX IF NOT EXISTS "ManualOverride_proposalId_idx" ON "ManualOverride"("proposalId");

-- Add foreign key for ManualOverride
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ManualOverride_proposalId_fkey'
    ) THEN
        ALTER TABLE "ManualOverride" ADD CONSTRAINT "ManualOverride_proposalId_fkey" 
        FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create ProposalVersion table if not exists
CREATE TABLE IF NOT EXISTS "ProposalVersion" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "changeReason" TEXT,

    CONSTRAINT "ProposalVersion_pkey" PRIMARY KEY ("id")
);

-- Create index on ProposalVersion
CREATE INDEX IF NOT EXISTS "ProposalVersion_proposalId_idx" ON "ProposalVersion"("proposalId");

-- Add foreign key for ProposalVersion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ProposalVersion_proposalId_fkey'
    ) THEN
        ALTER TABLE "ProposalVersion" ADD CONSTRAINT "ProposalVersion_proposalId_fkey" 
        FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

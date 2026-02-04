/**
 * Proposal Lifecycle State Machine (REQ-114: Section 4.14 & 9.2)
 * 
 * States: DRAFT → PENDING_REVIEW → APPROVED → SIGNED → CLOSED
 * 
 * CRITICAL RULES:
 * 1. SIGNED/CLOSED proposals are IMMUTABLE - no edits allowed
 * 2. Editing a signed proposal triggers AUTO-CLONE to new Draft
 * 3. E-Signature requires full audit trail (IP, email, hash)
 */

import crypto from "crypto";

// Valid state transitions
const STATE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_REVIEW", "CANCELLED"],
  PENDING_REVIEW: ["APPROVED", "DRAFT", "CANCELLED"],
  APPROVED: ["SIGNED", "DRAFT", "CANCELLED"],
  SIGNED: ["CLOSED"], // Cannot go back - IMMUTABLE
  CLOSED: [], // Terminal state - IMMUTABLE
  CANCELLED: ["DRAFT"], // Can reopen as draft
};

// Immutable states - NO EDITS ALLOWED
const IMMUTABLE_STATES = ["SIGNED", "CLOSED"];

// REQ-122: APPROVED state locks financial math (PRD Section 3.2)
// Only branding/cosmetic changes allowed, not financial data
const FINANCIAL_LOCKED_STATES = ["APPROVED", "SIGNED", "CLOSED"];

// Fields that are locked once APPROVED
export const LOCKED_FINANCIAL_FIELDS = [
  "margin",
  "desiredMargin", 
  "cost",
  "sellPrice",
  "bondRate",
  "taxRate",
  "structuralTonnage",
  "reinforcingTonnage",
  "pitchMm",
  "widthFt",
  "heightFt",
  "lineItems",
  "internalAudit",
];

export type ProposalStatus = 
  | "DRAFT" 
  | "PENDING_REVIEW" 
  | "APPROVED" 
  | "SIGNED" 
  | "CLOSED" 
  | "CANCELLED";

export interface SignaturePayload {
  signerEmail: string;
  signerName: string;
  signerTitle?: string;
  signerRole: "ANC_REPRESENTATIVE" | "PURCHASER";
  ipAddress: string;
  userAgent?: string;
  authMethod: "EMAIL_LINK" | "SSO" | "MANUAL";
}

/**
 * Check if a state transition is valid
 */
export function canTransition(from: string, to: string): boolean {
  const allowed = STATE_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

/**
 * Check if proposal is in an immutable state
 */
export function isImmutable(status: string): boolean {
  return IMMUTABLE_STATES.includes(status);
}

/**
 * Generate SHA-256 hash of proposal data for integrity verification
 */
export function generateDocumentHash(proposalData: any): string {
  const normalized = JSON.stringify(proposalData, Object.keys(proposalData).sort());
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Check if financial fields are locked (APPROVED or higher)
 */
export function isFinancialLocked(status: string): boolean {
  return FINANCIAL_LOCKED_STATES.includes(status);
}

/**
 * Validate edit attempt - checks both immutability and financial locking
 */
export function validateEditAttempt(
  status: string, 
  proposalId: string,
  fieldPath?: string
): { 
  allowed: boolean; 
  requiresClone: boolean;
  message: string;
} {
  // Fully immutable states (SIGNED/CLOSED)
  if (isImmutable(status)) {
    return {
      allowed: false,
      requiresClone: true,
      message: `Proposal is ${status} and cannot be edited. Create a new version (clone) to make changes.`
    };
  }

  // REQ-122: APPROVED state - financial fields locked
  if (isFinancialLocked(status) && fieldPath) {
    const isFinancialField = LOCKED_FINANCIAL_FIELDS.some(f => 
      fieldPath.includes(f) || fieldPath.endsWith(f)
    );
    
    if (isFinancialField) {
      return {
        allowed: false,
        requiresClone: false,
        message: `Financial field '${fieldPath}' is locked in ${status} state. Only cosmetic/branding changes allowed.`
      };
    }
  }

  return {
    allowed: true,
    requiresClone: false,
    message: "Edit allowed"
  };
}

/**
 * REQ-122: Validate transition to APPROVED state
 * Requires all Blue Glow (AI-filled) fields to be human-verified
 * 
 * @param currentStatus - Current proposal status
 * @param aiFilledFields - Array of field paths that were AI-extracted
 * @param verifiedFields - Object mapping field paths to verification records, OR array of verified field paths
 */
export function validateApprovalTransition(
  currentStatus: string,
  aiFilledFields: string[],
  verifiedFields: string[] | Record<string, any>
): {
  valid: boolean;
  error?: string;
  unverifiedFields?: string[];
} {
  // Check valid transition
  if (!canTransition(currentStatus, "APPROVED")) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to APPROVED. Must be in PENDING_REVIEW state.`
    };
  }

  // Handle both array and object formats for verifiedFields
  let verifiedFieldPaths: string[] = [];
  if (Array.isArray(verifiedFields)) {
    verifiedFieldPaths = verifiedFields;
  } else if (typeof verifiedFields === 'object' && verifiedFields !== null) {
    // Extract field paths from verification records object
    verifiedFieldPaths = Object.keys(verifiedFields);
  }

  // REQ-122: All Blue Glow fields must be verified before approval
  // Only check if there are AI-filled fields (Mirror Mode may have none)
  if (aiFilledFields.length > 0) {
    const unverifiedFields = aiFilledFields.filter(f => !verifiedFieldPaths.includes(f));

    if (unverifiedFields.length > 0) {
      return {
        valid: false,
        error: `Cannot approve: ${unverifiedFields.length} AI-extracted field(s) have not been human-verified.`,
        unverifiedFields
      };
    }
  }

  return { valid: true };
}

/**
 * Prepare approval transition - locks financial data
 */
export function prepareApprovalTransition(
  proposalData: any
): {
  status: "APPROVED";
  financialSnapshot: {
    lockedAt: Date;
    hash: string;
    margins: Record<string, number>;
    totals: Record<string, number>;
  };
} {
  const now = new Date();
  
  // Capture financial snapshot at approval time
  const screens = proposalData.details?.screens || [];
  const margins: Record<string, number> = {};
  const totals: Record<string, number> = {};

  screens.forEach((s: any, i: number) => {
    margins[`screen_${i}`] = s.desiredMargin || s.margin || 0;
    totals[`screen_${i}`] = s.sellPrice || s.finalClientTotal || 0;
  });

  return {
    status: "APPROVED",
    financialSnapshot: {
      lockedAt: now,
      hash: generateDocumentHash({ margins, totals, lockedAt: now }),
      margins,
      totals,
    }
  };
}

/**
 * Prepare signature transition - validates and returns lock data
 */
export function prepareSignatureTransition(
  currentStatus: string,
  proposalData: any,
  signaturePayload: SignaturePayload
): {
  valid: boolean;
  error?: string;
  lockData?: {
    status: "SIGNED";
    isLocked: true;
    lockedAt: Date;
    documentHash: string;
  };
  auditTrailData?: {
    signerEmail: string;
    signerName: string;
    signerTitle: string | null;
    signerRole: string;
    ipAddress: string;
    userAgent: string | null;
    authMethod: string;
    documentHash: string;
    signedAt: Date;
  };
} {
  // Validate transition
  if (!canTransition(currentStatus, "SIGNED")) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to SIGNED. Must be in APPROVED state.`
    };
  }

  // Validate signature payload
  if (!signaturePayload.signerEmail || !signaturePayload.signerName) {
    return {
      valid: false,
      error: "Signer email and name are required for signature."
    };
  }

  if (!signaturePayload.ipAddress) {
    return {
      valid: false,
      error: "IP address is required for audit trail."
    };
  }

  // Generate document hash
  const documentHash = generateDocumentHash(proposalData);
  const now = new Date();

  return {
    valid: true,
    lockData: {
      status: "SIGNED",
      isLocked: true,
      lockedAt: now,
      documentHash,
    },
    auditTrailData: {
      signerEmail: signaturePayload.signerEmail,
      signerName: signaturePayload.signerName,
      signerTitle: signaturePayload.signerTitle || null,
      signerRole: signaturePayload.signerRole,
      ipAddress: signaturePayload.ipAddress,
      userAgent: signaturePayload.userAgent || null,
      authMethod: signaturePayload.authMethod,
      documentHash,
      signedAt: now,
    }
  };
}

/**
 * Prepare clone data for creating new version from signed proposal
 */
export function prepareCloneData(
  originalProposal: any,
  originalId: string,
  currentVersion: number
): {
  cloneData: any;
  newVersion: number;
} {
  // Deep clone and reset mutable fields
  const cloneData = JSON.parse(JSON.stringify(originalProposal));
  
  // Reset lifecycle fields
  cloneData.status = "DRAFT";
  cloneData.isLocked = false;
  cloneData.lockedAt = null;
  cloneData.documentHash = null;
  cloneData.parentProposalId = originalId;
  cloneData.versionNumber = currentVersion + 1;
  
  // Clear IDs (will be regenerated)
  delete cloneData.id;
  delete cloneData.createdAt;
  delete cloneData.updatedAt;
  delete cloneData.shareHash;
  
  // Update name to indicate version
  if (cloneData.clientName) {
    cloneData.clientName = `${cloneData.clientName} (v${currentVersion + 1})`;
  }

  return {
    cloneData,
    newVersion: currentVersion + 1
  };
}

/**
 * State machine summary for UI display
 * REQ-122: APPROVED locks financial editing but allows cosmetic changes
 */
export function getStatusInfo(status: string): {
  label: string;
  color: string;
  canEdit: boolean;
  canEditFinancial: boolean;  // NEW: Separate flag for financial fields
  canSign: boolean;
  canClose: boolean;
} {
  const info: Record<string, any> = {
    DRAFT: { 
      label: "Draft", 
      color: "yellow", 
      canEdit: true, 
      canEditFinancial: true,  // Full edit access
      canSign: false, 
      canClose: false 
    },
    PENDING_REVIEW: { 
      label: "Pending Review", 
      color: "blue", 
      canEdit: true, 
      canEditFinancial: true,  // Still editable during review
      canSign: false, 
      canClose: false 
    },
    APPROVED: { 
      label: "Approved", 
      color: "green", 
      canEdit: true,           // Cosmetic/branding edits allowed
      canEditFinancial: false, // ❌ FINANCIAL LOCKED (REQ-122)
      canSign: true, 
      canClose: false 
    },
    SIGNED: { 
      label: "Signed", 
      color: "purple", 
      canEdit: false,          // Fully immutable
      canEditFinancial: false, 
      canSign: false, 
      canClose: true 
    },
    CLOSED: { 
      label: "Closed", 
      color: "gray", 
      canEdit: false, 
      canEditFinancial: false, 
      canSign: false, 
      canClose: false 
    },
    CANCELLED: { 
      label: "Cancelled", 
      color: "red", 
      canEdit: false, 
      canEditFinancial: false, 
      canSign: false, 
      canClose: false 
    },
  };
  return info[status] || info.DRAFT;
}

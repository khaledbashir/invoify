/**
 * Blue Glow Persistence Utilities
 * 
 * Handles tracking and persisting AI-extracted field verification state.
 * Implements "Trust but Verify" audit trail (PRD Section 8.1).
 * 
 * REQ-126: Blue Glow Persistence & Audit Trail
 */

import { prisma } from "@/lib/prisma";

export interface VerifiedFieldRecord {
    verifiedBy: string;
    verifiedAt: string;
}

export interface BlueGlowState {
    aiFilledFields: string[];
    verifiedFields: Record<string, VerifiedFieldRecord>;
}

/**
 * Track AI-extracted fields when RAG extraction completes
 */
export async function trackAIFilledFields(
    proposalId: string,
    aiFilledFields: string[]
): Promise<void> {
    await prisma.proposal.update({
        where: { id: proposalId },
        data: {
            aiFilledFields: aiFilledFields as any,
        },
    });
}

/**
 * Verify a field (remove Blue Glow, add to audit trail)
 */
export async function verifyField(
    proposalId: string,
    fieldPath: string,
    verifiedBy: string
): Promise<{
    success: boolean;
    progress: { verified: number; total: number; completionRate: number };
}> {
    const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        select: {
            aiFilledFields: true,
            verifiedFields: true,
        },
    });

    if (!proposal) {
        throw new Error("Proposal not found");
    }

    const aiFields = (proposal.aiFilledFields as string[]) || [];
    const verifiedFields = (proposal.verifiedFields as any) || {};

    if (!aiFields.includes(fieldPath)) {
        throw new Error("Field was not AI-extracted");
    }

    const updatedVerifiedFields = {
        ...verifiedFields,
        [fieldPath]: {
            verifiedBy,
            verifiedAt: new Date().toISOString(),
        },
    };

    await prisma.proposal.update({
        where: { id: proposalId },
        data: {
            verifiedFields: updatedVerifiedFields as any,
            lastVerifiedBy: verifiedBy,
            lastVerifiedAt: new Date(),
        },
    });

    const verifiedCount = Object.keys(updatedVerifiedFields).length;
    const totalAiFields = aiFields.length;
    const completionRate = totalAiFields > 0 
        ? Math.round((verifiedCount / totalAiFields) * 100) 
        : 100;

    return {
        success: true,
        progress: {
            verified: verifiedCount,
            total: totalAiFields,
            completionRate,
        },
    };
}

/**
 * Get Blue Glow state for a proposal
 */
export async function getBlueGlowState(proposalId: string): Promise<BlueGlowState> {
    const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        select: {
            aiFilledFields: true,
            verifiedFields: true,
        },
    });

    if (!proposal) {
        return {
            aiFilledFields: [],
            verifiedFields: {},
        };
    }

    return {
        aiFilledFields: (proposal.aiFilledFields as string[]) || [],
        verifiedFields: (proposal.verifiedFields as any) || {},
    };
}

/**
 * Check if all AI fields are verified
 */
export async function areAllFieldsVerified(proposalId: string): Promise<boolean> {
    const state = await getBlueGlowState(proposalId);
    const aiFields = state.aiFilledFields;
    const verifiedFieldPaths = Object.keys(state.verifiedFields);

    if (aiFields.length === 0) {
        return true; // No AI fields = nothing to verify
    }

    return aiFields.every(field => verifiedFieldPaths.includes(field));
}

/**
 * Get unverified fields list
 */
export async function getUnverifiedFields(proposalId: string): Promise<string[]> {
    const state = await getBlueGlowState(proposalId);
    const aiFields = state.aiFilledFields;
    const verifiedFieldPaths = Object.keys(state.verifiedFields);

    return aiFields.filter(field => !verifiedFieldPaths.includes(field));
}

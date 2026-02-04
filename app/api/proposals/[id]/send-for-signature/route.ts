/**
 * POST /api/proposals/[id]/send-for-signature
 * 
 * Sends a proposal PDF to DocuSign for e-signature.
 * Creates an envelope with signature tabs mapped to the PDF signature block.
 * 
 * Phase 2.3: Digital Signatures
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocuSignService, createDocuSignService } from "@/lib/signatures/docusign";
import { generateProposalPdfService } from "@/services/proposal/server/generateProposalPdfService";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: proposalId } = await params;
        
        // Get proposal from database
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
        });

        if (!proposal) {
            return NextResponse.json(
                { error: "Proposal not found" },
                { status: 404 }
            );
        }

        // Check if proposal is already signed
        if (proposal.status === "SIGNED" || proposal.isLocked) {
            return NextResponse.json(
                { error: "Proposal is already signed and locked" },
                { status: 400 }
            );
        }

        // Get DocuSign service instance
        const docusignService = createDocuSignService();
        if (!docusignService) {
            return NextResponse.json(
                { error: "DocuSign not configured. Please set DOCUSIGN_INTEGRATOR_KEY, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY, and DOCUSIGN_ACCOUNT_ID environment variables." },
                { status: 500 }
            );
        }

        // Parse request body for signer information
        const body = await req.json();
        
        // Extract receiver data from proposal
        // Proposal model stores client info in flat fields (clientName, clientAddress, etc.)
        // Email may be in request body or need to be provided
        const signers = body.signers || [
            {
                name: proposal.clientName || "Client",
                email: body.clientEmail || body.email || "",
                role: "signer" as const,
            },
        ];

        if (!signers[0]?.email) {
            return NextResponse.json(
                { error: "Signer email is required" },
                { status: 400 }
            );
        }

        // Generate PDF blob
        // Create a mock request with proposal data
        const mockRequest = new NextRequest(req.url, {
            method: "POST",
            body: JSON.stringify(proposal as any),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const pdfResponse = await generateProposalPdfService(mockRequest);
        if (!pdfResponse.ok) {
            const errorData = await pdfResponse.json();
            return NextResponse.json(
                { error: "Failed to generate PDF", details: errorData },
                { status: 500 }
            );
        }

        const pdfBlob = await pdfResponse.blob();

        // Generate document hash for audit trail
        const documentHash = DocuSignService.generateDocumentHash(proposal);

        // Send envelope to DocuSign
        // Note: Signature tab coordinates need to be detected from PDF
        // For now, using approximate coordinates based on template layout
        // TODO: Implement PDF coordinate detection for signature blocks
        const envelopeResult = await docusignService.sendEnvelope(
            pdfBlob,
            signers,
            proposalId
        );

        // Store envelope ID in proposal metadata
        // Note: Using APPROVED status as PENDING_SIGNATURE doesn't exist in enum
        // The proposal is approved and ready for signature
        await prisma.proposal.update({
            where: { id: proposalId },
            data: {
                status: "APPROVED", // Proposal is approved and sent for signature
                documentConfig: {
                    ...((proposal.documentConfig as any) || {}),
                    docusignEnvelopeId: envelopeResult.envelopeId,
                    docusignStatus: envelopeResult.status,
                    documentHash,
                },
            },
        });

        return NextResponse.json({
            success: true,
            envelopeId: envelopeResult.envelopeId,
            status: envelopeResult.status,
            message: "Proposal sent for signature",
        });
    } catch (error: any) {
        console.error("Send for signature error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to send proposal for signature" },
            { status: 500 }
        );
    }
}

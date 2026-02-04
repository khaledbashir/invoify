/**
 * POST /api/webhooks/docusign
 * 
 * DocuSign webhook receiver for envelope status updates.
 * Listens for envelope.completed events and locks proposals.
 * 
 * REQ-126: Digital Signature Completion (Phase 2.3)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * DocuSign webhook event types
 */
type DocuSignEvent = 
    | "envelope-sent"
    | "envelope-delivered"
    | "envelope-completed"
    | "envelope-declined"
    | "envelope-voided";

interface DocuSignWebhookPayload {
    event: DocuSignEvent;
    data: {
        envelopeId: string;
        status: string;
        statusDateTime: string;
        recipients?: Array<{
            name: string;
            email: string;
            status: string;
            signedDateTime?: string;
        }>;
    };
    customFields?: {
        proposalId?: string; // We'll pass this in the envelope custom fields
    };
}

/**
 * Verify webhook signature (optional but recommended for production)
 */
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export async function POST(req: NextRequest) {
    try {
        // Get webhook secret from environment
        const webhookSecret = process.env.DOCUSIGN_WEBHOOK_SECRET;
        
        // Read raw body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get("x-docusign-signature") || "";

        // Verify signature if secret is configured
        if (webhookSecret && signature) {
            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid webhook signature" },
                    { status: 401 }
                );
            }
        }

        // Parse webhook payload
        const payload: DocuSignWebhookPayload = JSON.parse(rawBody);

        // Handle envelope.completed event
        if (payload.event === "envelope-completed") {
            const { envelopeId } = payload.data as any;
            
            // Extract proposalId from envelope custom fields
            // DocuSign sends custom fields in a different format
            const envelopeCustomFields = (payload.data as any).customFields;
            let proposalId: string | undefined;
            
            if (envelopeCustomFields?.textCustomFields) {
                const proposalIdField = envelopeCustomFields.textCustomFields.find(
                    (f: any) => f.name === "proposalId"
                );
                proposalId = proposalIdField?.value;
            }

            if (!proposalId) {
                console.warn("DocuSign webhook: No proposalId in custom fields", envelopeId);
                return NextResponse.json({ ok: true, message: "No proposalId found" });
            }

            // Find proposal by DocuSign envelope ID or proposal ID
            const proposal = await prisma.proposal.findFirst({
                where: {
                    OR: [
                        { id: proposalId },
                        // TODO: Add envelopeId field to Proposal model if tracking DocuSign envelopes
                    ],
                },
            });

            if (!proposal) {
                console.warn("DocuSign webhook: Proposal not found", proposalId);
                return NextResponse.json({ ok: true, message: "Proposal not found" });
            }

            // Lock the proposal (make it immutable)
            await prisma.proposal.update({
                where: { id: proposal.id },
                data: {
                    status: "SIGNED",
                    isLocked: true,
                    lockedAt: new Date(),
                    documentHash: crypto
                        .createHash("sha256")
                        .update(JSON.stringify(proposal))
                        .digest("hex"),
                },
            });

            // TODO: Create SignatureAuditTrail records from webhook recipient data
            // This requires the SignatureAuditTrail model to be added to Prisma schema

            console.log(`DocuSign webhook: Proposal ${proposalId} locked after signature completion`);

            return NextResponse.json({
                ok: true,
                message: "Proposal locked successfully",
                proposalId: proposal.id,
            });
        }

        // Handle other events (log but don't take action)
        console.log(`DocuSign webhook: Event ${payload.event} received`, payload.data);

        return NextResponse.json({ ok: true, message: "Webhook received" });
    } catch (error: any) {
        console.error("DocuSign webhook error:", error);
        return NextResponse.json(
            { error: error?.message || "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/docusign
 * DocuSign webhook verification endpoint
 * DocuSign sends a GET request to verify the webhook URL
 */
export async function GET(req: NextRequest) {
    const challenge = req.nextUrl.searchParams.get("challenge");
    
    if (challenge) {
        // Return challenge value to verify webhook URL
        return NextResponse.json({ challenge });
    }

    return NextResponse.json({ message: "DocuSign webhook endpoint" });
}

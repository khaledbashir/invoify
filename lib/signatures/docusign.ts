/**
 * DocuSign Integration Service
 * 
 * Implements e-signature workflow for stadium contracts using DocuSign API v2.1.
 * Provides envelope creation, status tracking, and signature audit trail.
 * 
 * REQ-126: Digital Signature Completion (Phase 2.3)
 */

import crypto from "crypto";

export interface DocuSignConfig {
    baseUrl: string; // DocuSign API base URL (sandbox or production)
    integratorKey: string; // DocuSign Integrator Key (Client ID)
    userId: string; // DocuSign User ID (email)
    privateKey: string; // RSA private key for JWT authentication
    accountId: string; // DocuSign Account ID
}

export interface DocuSignEnvelope {
    envelopeId: string;
    status: "sent" | "delivered" | "completed" | "declined" | "voided";
    statusDateTime: string;
    recipients: DocuSignRecipient[];
}

export interface DocuSignRecipient {
    name: string;
    email: string;
    role: "signer" | "carbonCopy";
    status: "sent" | "delivered" | "signed" | "declined";
    signedDateTime?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
}

export interface SignatureAuditRecord {
    signerName: string;
    signerEmail: string;
    signedAt: Date;
    ipAddress: string;
    deviceFingerprint: string;
    documentHash: string; // SHA-256 hash of proposal at signing moment
    certificateOfCompletion?: string; // DocuSign Certificate of Completion URL
}

/**
 * DocuSign Service Class
 */
export class DocuSignService {
    private config: DocuSignConfig;

    constructor(config: DocuSignConfig) {
        this.config = config;
    }

    /**
     * Generate JWT token for DocuSign authentication
     * DocuSign uses JWT (JSON Web Token) for server-to-server authentication
     */
    private async generateJWT(): Promise<string> {
        // TODO: Implement JWT generation using private key
        // This requires the 'jsonwebtoken' package
        // For now, return placeholder
        throw new Error("JWT generation not yet implemented. Install 'jsonwebtoken' package.");
    }

    /**
     * Get access token from DocuSign using JWT
     */
    private async getAccessToken(): Promise<string> {
        const jwt = await this.generateJWT();
        
        // Request access token from DocuSign
        const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: jwt,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DocuSign authentication failed: ${error}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    /**
     * Send envelope (signature request) to recipients
     * 
     * @param proposalPdf - PDF blob of the proposal to be signed
     * @param signers - Array of signer information
     * @param proposalId - ANC Studio proposal ID for tracking
     * @returns Envelope ID and status
     */
    async sendEnvelope(
        proposalPdf: Blob,
        signers: Array<{ name: string; email: string; role?: "signer" | "carbonCopy" }>,
        proposalId: string
    ): Promise<{ envelopeId: string; status: string }> {
        const accessToken = await this.getAccessToken();

        // Convert PDF blob to base64
        const pdfBase64 = await this.blobToBase64(proposalPdf);

        // Create envelope definition
        const envelopeDefinition = {
            emailSubject: "ANC Sports Proposal - Signature Required",
            documents: [
                {
                    documentBase64: pdfBase64,
                    name: `ANC_Proposal_${proposalId}.pdf`,
                    fileExtension: "pdf",
                    documentId: "1",
                },
            ],
            recipients: {
                signers: signers
                    .filter(s => s.role !== "carbonCopy")
                    .map((signer, index) => ({
                        email: signer.email,
                        name: signer.name,
                        recipientId: `${index + 1}`,
                        routingOrder: `${index + 1}`,
                        tabs: {
                            signHereTabs: [
                                {
                                    documentId: "1",
                                    pageNumber: "1", // TODO: Detect signature block page dynamically
                                    xPosition: "100",
                                    yPosition: "700",
                                },
                            ],
                        },
                    })),
                carbonCopies: signers
                    .filter(s => s.role === "carbonCopy")
                    .map((cc, index) => ({
                        email: cc.email,
                        name: cc.name,
                        recipientId: `cc${index + 1}`,
                    })),
            },
            status: "sent",
        };

        // Send envelope via DocuSign API
        const response = await fetch(
            `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(envelopeDefinition),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DocuSign envelope creation failed: ${error}`);
        }

        const data = await response.json();
        return {
            envelopeId: data.envelopeId,
            status: data.status,
        };
    }

    /**
     * Get envelope status
     */
    async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
        const accessToken = await this.getAccessToken();

        const response = await fetch(
            `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get envelope status: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            envelopeId: data.envelopeId,
            status: data.status,
            statusDateTime: data.statusDateTime,
            recipients: data.recipients?.signers?.map((r: any) => ({
                name: r.name,
                email: r.email,
                role: "signer" as const,
                status: r.status,
                signedDateTime: r.signedDateTime,
            })) || [],
        };
    }

    /**
     * Download signed PDF from completed envelope
     */
    async downloadSignedPdf(envelopeId: string): Promise<Blob> {
        const accessToken = await this.getAccessToken();

        const response = await fetch(
            `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/documents/combined`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to download signed PDF: ${response.statusText}`);
        }

        return await response.blob();
    }

    /**
     * Get Certificate of Completion (audit trail document)
     */
    async getCertificateOfCompletion(envelopeId: string): Promise<string> {
        const accessToken = await this.getAccessToken();

        const response = await fetch(
            `${this.config.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}/documents/certificate`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get certificate: ${response.statusText}`);
        }

        const blob = await response.blob();
        return await this.blobToBase64(blob);
    }

    /**
     * Create signature audit record from DocuSign envelope data
     */
    async createAuditRecord(
        envelopeId: string,
        proposalHash: string
    ): Promise<SignatureAuditRecord[]> {
        const envelope = await this.getEnvelopeStatus(envelopeId);
        const certificate = await this.getCertificateOfCompletion(envelopeId);

        return envelope.recipients
            .filter(r => r.status === "signed")
            .map(recipient => ({
                signerName: recipient.name,
                signerEmail: recipient.email,
                signedAt: new Date(recipient.signedDateTime || envelope.statusDateTime),
                ipAddress: recipient.ipAddress || "unknown",
                deviceFingerprint: recipient.deviceFingerprint || "unknown",
                documentHash: proposalHash,
                certificateOfCompletion: certificate,
            }));
    }

    /**
     * Helper: Convert blob to base64
     */
    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Generate document hash (SHA-256) for audit trail
     */
    static generateDocumentHash(proposalData: any): string {
        const jsonString = JSON.stringify(proposalData);
        return crypto.createHash("sha256").update(jsonString).digest("hex");
    }
}

/**
 * Create DocuSign service instance from environment variables
 */
export function createDocuSignService(): DocuSignService | null {
    const baseUrl = process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net"; // Default to sandbox
    const integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY;
    const userId = process.env.DOCUSIGN_USER_ID;
    const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;

    if (!integratorKey || !userId || !privateKey || !accountId) {
        console.warn("DocuSign credentials not configured. E-signature features will be disabled.");
        return null;
    }

    return new DocuSignService({
        baseUrl,
        integratorKey,
        userId,
        privateKey,
        accountId,
    });
}

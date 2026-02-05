// Zod
import z from "zod";
import { PricingDocument } from "@/types/pricing";

// RHF
import { FieldPath, UseFormReturn } from "react-hook-form";

// Zod schemas
import { ProposalSchema, ItemSchema } from "@/lib/schemas";

// Form types
export type ProposalType = z.infer<typeof ProposalSchema> & {
    metadata?: {
        filledByAI?: string[]; // DEPRECATED
        aiFilledFields?: string[];
        verifiedFields?: Record<string, { verifiedBy: string; verifiedAt: string }>;
    };
    marginAnalysis?: any[];
    pricingDocument?: PricingDocument;
};
export type ItemType = z.infer<typeof ItemSchema>;
export type FormType = UseFormReturn<ProposalType>;
export type NameType = FieldPath<ProposalType>;
export type CurrencyType = {
    [currencyCode: string]: string;
};

export type CurrencyDetails = {
    currency: string;
    decimals: number;
    beforeDecimal: string | null;
    afterDecimal: string | null;
};

// Signature types
export type SignatureColor = {
    name: string;
    label: string;
    color: string;
};

export type SignatureFont = {
    name: string;
    variable: string;
};

export enum SignatureTabs {
    DRAW = "draw",
    TYPE = "type",
    UPLOAD = "upload",
}

// Wizard types
export type WizardStepType = {
    id: number;
    label: string;
    isValid?: boolean;
};

// Export types
export enum ExportTypes {
    PDF = "PDF",
    XLSX = "XLSX",
    JSON = "JSON",
    CSV = "CSV",
    XML = "XML",
}

// Calculation Mode types
export enum CalculationMode {
    MIRROR = "MIRROR",
    INTELLIGENCE = "INTELLIGENCE",
}

export enum Venue {
    STADIUM = "Milan Puskar Stadium",
    COLISEUM = "WVU Coliseum",
    GENERIC = "Generic",
}


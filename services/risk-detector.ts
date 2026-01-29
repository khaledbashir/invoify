
import { ProposalType } from "@/types";

export interface RiskItem {
    id: string;
    risk: string;
    trigger: string;
    impact: string;
    priority: "HIGH" | "CRITICAL";
    actionRequired: string;
}

/**
 * Detects high-priority risks based on RAG extraction rules and Proposal Data.
 */
export function detectRisks(data: ProposalType, rulesDetected?: any): RiskItem[] {
    const risks: RiskItem[] = [];

    // 1. UNION LABOR (CRITICAL)
    if (rulesDetected?.requiresUnionLabor) {
        risks.push({
            id: "risk-union",
            risk: "Union Labor Requirement",
            trigger: "Keywords: 'IBEW', 'Union', 'Prevailing Wage' detected in RFP.",
            impact: "Labor costs may be 2-3x higher than standard.",
            priority: "CRITICAL",
            actionRequired: "Verify 'Labor' rate in Internal Audit matches local Union rates."
        });
    }

    // 2. WTC / HIGH COMPLEXITY (CRITICAL)
    if (rulesDetected?.isWtcLocation || (data.details.location || "").toLowerCase().includes("world trade")) {
        risks.push({
            id: "risk-wtc",
            risk: "High-Security Site (WTC)",
            trigger: "Location identified as World Trade Center.",
            impact: "Requires SWAC badges, night-only work, and strict delivery windows.",
            priority: "CRITICAL",
            actionRequired: "Add 20% logistics buffer to 'Installation' and 'Shipping'."
        });
    }

    // 3. SPARE PARTS (HIGH)
    // Check if 5% spares are required but NOT toggled on
    const hasSparePartsRule = rulesDetected?.requiresSpareParts || rulesDetected?.minSpareParts; // robust check
    const screens = data.details.screens || [];
    const missingSpares = screens.some(s => s.includeSpareParts === false);

    if (hasSparePartsRule && missingSpares) {
        risks.push({
            id: "risk-spares",
            risk: "Missing 5% Spare Parts",
            trigger: "RFP requires 'Attic Stock' or '5% Spares'.",
            impact: "Bid will be non-compliant and under-priced.",
            priority: "HIGH",
            actionRequired: "Enable 'Include Spare Parts' for all screens."
        });
    }

    // 4. PERFORMANCE BOND (HIGH)
    if (rulesDetected?.requiresBond) {
        risks.push({
            id: "risk-bond",
            risk: "Performance Bond Req.",
            trigger: "RFP mentions 'Performance Bond' or 'Surety'.",
            impact: "Adds 1.5% to total project cost.",
            priority: "HIGH",
            actionRequired: "Ensure 'Performance Bond' is set to 1.5% in Audit."
        });
    }

    return risks;
}

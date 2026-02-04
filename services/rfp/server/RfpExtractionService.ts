import { ANYTHING_LLM_BASE_URL, ANYTHING_LLM_KEY } from "@/lib/variables";
import { ProposalType } from "@/types";

/**
 * RfpExtractionService
 * Bridges AnythingLLM intelligence with the Natalia form state.
 * Extracts technical specs, naming, and Ferrari logic from raw RFP text.
 */
export class RfpExtractionService {
    /**
     * extractFromWorkspace
     * Asks AnythingLLM to analyze documents in the workspace and return structured proposal data.
     */
    static async extractFromWorkspace(workspaceSlug: string): Promise<any> {
        if (!ANYTHING_LLM_BASE_URL || !ANYTHING_LLM_KEY) {
            throw new Error("AnythingLLM not configured");
        }

        const prompt = `
      You are the ANC Digital Signage Expert AI. 
      Analyze the RFP document(s) in this workspace and extract a complete set of technical specifications and project metadata.
      
      ===== CRITICAL FOCUS: DIVISION 11 PRIORITY (MASTER TRUTH) =====
      You MUST prioritize and search for these sections in EXACT order of priority:
      1. "SECTION 11 06 60" (Display Schedule) - HIGHEST PRIORITY - This is the absolute Master Truth for quantities and dimensions
      2. "SECTION 11 63 10" (LED Display Systems) - SECOND PRIORITY - Technical specifications
      3. "Division 11" - THIRD PRIORITY - General LED display requirements
      
      REPEAT THESE KEYWORDS MULTIPLE TIMES IN YOUR SEARCH: "Section 11 06 60", "Display Schedule", "Section 11 63 10", "LED Display Systems"
      Data found in Section 11 06 60 overrides ALL other sections. If you find Section 11 06 60, set extractionAccuracy to "High".
      
      ===== MANDATORY CITATION REQUIREMENT (Trust but Verify) =====
      For EVERY extracted value, you MUST include a citation in this EXACT format:
      "[Source: Section X.XX, Page Y]"
      
      Example: "pixelPitch": { "value": 10, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.95 }
      
      If no specific page/section is found, use: "[Source: Document Analysis]"
      
      ===== CONFIDENCE SCORING (REQUIRED) =====
      For each extracted field, include a confidence score (0.0 to 1.0):
      - 0.95-1.0: High confidence (found in Section 11 06 60 or Section 11 63 10)
      - 0.80-0.94: Medium confidence (found in Division 11 or related sections)
      - 0.60-0.79: Low confidence (inferred from context, may need verification)
      - <0.60: Very low confidence (set to null, trigger Gap Fill)
      
      Format: { "value": <actual>, "citation": "[Source: ...]", "confidence": 0.95 }
      
      ===== SPECIFIC EXTRACTION TARGETS (17/20 Rule) =====
      Extract these 20 critical fields. Target: 17 out of 20 (85% completion rate).
      
      PROJECT-LEVEL FIELDS (5):
      1. Client Name (receiver.name)
      2. Client Address (receiver.address)
      3. Project Title (details.proposalName)
      4. Venue Name (details.venue)
      5. Extraction Accuracy ("High" if Section 11 06 60 found, else "Standard")
      
      PER-SCREEN FIELDS (12 per screen, minimum 1 screen required):
      For EACH display in the LED Display Schedule (Section 11 06 60):
      6. Screen Name (e.g., "North Upper Display", "Center Hung Video Board")
      7. Quantity (Qty) - Number of identical displays
      8. Location/Zone (e.g., "Northeast Main Concourse", "South End Zone")
      9. Pixel Pitch (e.g., 4mm, 6mm, 10mm) - CRITICAL FIELD
      10. Active Area Width (feet/inches) - CRITICAL FIELD
      11. Active Area Height (feet/inches) - CRITICAL FIELD
      12. Resolution Width (pixels) - If dimensions missing, calculate from width/pitch
      13. Resolution Height (pixels) - If dimensions missing, calculate from height/pitch
      14. Brightness (cd/m² or nits) - Extract numeric value, label as "Brightness"
      15. Application (indoor|outdoor) - Infer from context if not explicit
      16. Service Type (front|rear|top) - May require Gap Fill if not specified
      17. Structural Tonnage (tons) - From Thornton Tomasetti/TTE reports only
      
      INTERNAL-ONLY FIELDS (do not show to client):
      - Pixel Density (pixels/sq.ft) - Mark as internalOnly: true
      - HDR Status - Mark as internalOnly: true
      
      EXTRACTION STRATEGY:
      1. FIRST: Search for "LED Display Schedule" table in Section 11 06 60
      2. SECOND: If not found, search Section 11 63 10 for technical specs
      3. THIRD: Search Division 11 for general requirements
      4. FOR EACH FIELD: Include citation and confidence score
      5. IF CONFIDENCE < 0.85: Set field to null (triggers Gap Fill)
      6. IF "Section 11 06 60" found: Set extractionAccuracy to "High"

      CRITICAL: You must detect specific ANC "Ferrari Level" site rules:
      1. UNION LABOR: Does the RFP require IBEW/Union Labor? (Search for "Labor", "Union", "Collective Bargaining")
      2. WTC LOCATION: Is this project at the World Trade Center (Complexity level 10)?
      3. SPARE PARTS: Is there a "Minimum 5% Spare Parts" requirement? (Mapped to includeSpareParts)
      4. REPLACEMENT: Is this a replacement project? (Mapped to isReplacement)
      5. HDR/BRIGHTNESS: Extract required Brightness rating and HDR support from Section 11 63 10.
         - IMPORTANT: Mark any "HDR Status" as internalOnly: true (do not show in client PDF)
      6. STRUCTURAL (Thornton Tomasetti): Does the RFP include a structural report from "Thornton Tomasetti" or "TTE"? 
         If so, extract the Tonnage estimates:
         - Search for "reinforcing steel" tonnage (e.g., 17 tons).
         - Search for "new steel columns/beams" tonnage (e.g., 17 tons).
         - Map these to metadata fields structuralTonnage and reinforcingTonnage.

      NOISE REDUCTION RULE (Critical):
      - "Pixel Density" (e.g., "Physical Pixel Density (pixels/sq.ft)") must be marked as internalOnly: true
      - "HDR Status" must be marked as internalOnly: true
      - These fields are extracted for internal reference but MUST NOT appear in the client-facing Specification Table
      - For any field that should NOT be shown to the client, include "internalOnly": true in the field object
      
      ===== OUTPUT FORMAT =====
      Return ONLY a valid JSON object. No markdown, no conversational text.
      
      {
        "clientName": { "value": "...", "citation": "[Source: ...]", "confidence": 0.95 },
        "projectTitle": { "value": "...", "citation": "[Source: ...]", "confidence": 0.90 },
        "venue": "Milan Puskar Stadium" | "WVU Coliseum" | "Generic",
        "extractionAccuracy": "High" | "Standard",
        "screens": [
          {
            "name": { "value": "North Upper Display", "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.98 },
            "quantity": { "value": 1, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.95 },
            "location": { "value": "North End Zone", "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.90 },
            "pixelPitch": { "value": 10, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.95 },
            "width": { "value": 40, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.95 },
            "height": { "value": 20, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.95 },
            "pixelsW": { "value": 1200, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.90 },
            "pixelsH": { "value": 600, "citation": "[Source: Section 11 06 60, Page 9]", "confidence": 0.90 },
            "brightness": { "value": 6000, "citation": "[Source: Section 11 63 10, Page 15]", "confidence": 0.85 },
            "application": { "value": "outdoor", "citation": "[Source: Document Analysis]", "confidence": 0.75 },
            "serviceType": null,  // Not found - triggers Gap Fill
            "structuralTonnage": null  // Not found in TTE report
          }
        ],
        "rulesDetected": {
           "requiresUnionLabor": { "value": true, "citation": "[Source: Section X, Page Y]", "confidence": 0.90 },
           "isWtcLocation": { "value": false, "citation": "[Source: Document Analysis]", "confidence": 0.95 },
           "requiresSpareParts": { "value": true, "citation": "[Source: Exhibit A, Page 11]", "confidence": 0.85 },
           "requiresBond": { "value": true, "citation": "[Source: Section X, Page Y]", "confidence": 0.80 },
           "structuralTonnage": { "value": 17, "citation": "[Source: TTE Report, Page X]", "confidence": 0.95 },
           "reinforcingTonnage": { "value": 17, "citation": "[Source: TTE Report, Page X]", "confidence": 0.95 }
        },
        "extractionSummary": {
          "totalFields": 20,
          "extractedFields": 17,
          "completionRate": 0.85,
          "highConfidenceFields": 15,
          "lowConfidenceFields": 2,
          "missingFields": ["serviceType", "structuralTonnage"]
        }
      }
      
      ===== CRITICAL REMINDERS =====
      - Section 11 06 60 is Master Truth - prioritize it above all else
      - Include citations for EVERY extracted value
      - Include confidence scores (0.0 to 1.0)
      - Set fields to null if confidence < 0.85 (triggers Gap Fill)
      - Mark internal-only fields (pixel density, HDR) as internalOnly: true
      - Return ONLY JSON, no markdown or explanatory text
    `;

        try {
            const response = await fetch(`${ANYTHING_LLM_BASE_URL}/workspace/${workspaceSlug}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ANYTHING_LLM_KEY}`,
                },
                body: JSON.stringify({
                    message: prompt,
                    mode: "chat",
                }),
            });

            if (!response.ok) throw new Error(`AnythingLLM API Error: ${response.statusText}`);

            const data = await response.json();
            const rawContent = data.textResponse || ""; // AnythingLLM returns textResponse in chat mode

            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No valid JSON found in AI response: " + rawContent);

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("RfpExtractionService error:", error);
            throw error;
        }
    }
}

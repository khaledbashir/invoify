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
      
      CRITICAL FOCUS (Division 11): 
      Prioritize and isolate "Section 11 63 10" (LED Display and Control Systems) and "Section 11 06 60" (LED Display Schedule).
      If these sections are found, ensure they are used as the primary source of truth.
      Specifically, look for the "LED Display Schedule" table to extract quantity, dimensions, and pitch.
      Mark "extractionAccuracy": "High" if these specific sections were located.

      CRITICAL: You must detect specific ANC "Ferrari Level" site rules:
      1. UNION LABOR: Does the RFP require IBEW/Union Labor? (Search for "Labor", "Union", "Collective Bargaining")
      2. WTC LOCATION: Is this project at the World Trade Center (Complexity level 10)?
      3. SPARE PARTS: Is there a "Minimum 5% Spare Parts" requirement? (Mapped to includeSpareParts)
      4. REPLACEMENT: Is this a replacement project? (Mapped to isReplacement)
      5. HDR/BRIGHTNESS: Extract required Nits (brightness) and HDR support from Section 11 63 10.
      
      OUTPUT FORMAT: Return ONLY a valid JSON object. No markdown, no conversational text.
      
      {
        "clientName": "...",
        "projectTitle": "...",
        "extractionAccuracy": "High" | "Standard",
        "screens": [
          {
            "name": "Internal shorthand (e.g. Ribbon 1)",
            "externalName": "Client-facing professional name",
            "widthFt": 0.0,
            "heightFt": 0.0,
            "pitchMm": 0.0,
            "pixelsH": 0,
            "pixelsW": 0,
            "brightness": "...",
            "quantity": 1,
            "serviceType": "Top" | "Front/Rear",
            "isReplacement": boolean,
            "useExistingStructure": boolean,
            "includeSpareParts": boolean
          }
        ],
        "rulesDetected": {
           "requiresUnionLabor": boolean,
           "isWtcLocation": boolean
        }
      }
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

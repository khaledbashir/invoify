import { z } from 'zod';

// ------------------------------------------------------------------
// The "17 Tons" Schema
// ------------------------------------------------------------------

export const StructuralWeightSchema = z.object({
    weights: z.array(z.object({
        value: z.number().describe("The numeric weight value (e.g., 17)"),
        unit: z.enum(['tons', 'lbs', 'kg', 'kips']).describe("The unit of measurement"),
        context: z.string().describe("The surrounding text context describing what this weight refers to (e.g., 'Main LED Support Structure')"),
        pageNumber: z.number().optional(),
        confidence: z.number().min(0).max(1)
    })),
    totalCalculatedWeight: z.number().optional().describe("Sum of all relevant structural weights in tons")
});

export type StructuralWeightResult = z.infer<typeof StructuralWeightSchema>;

// ------------------------------------------------------------------
// Extraction Logic (Generic LLM Handler)
// ------------------------------------------------------------------

/**
 * Extracts structural weights from a chunk of text (e.g., Engineering Report page).
 * Uses a "System Prompt" designed for Zhipu/GLM-4 or GPT-4.
 */
export async function extractStructuralWeights(
    textChunk: string,
    llmCall: (prompt: string) => Promise<string>
): Promise<StructuralWeightResult> {

    const prompt = `
    You are a Structural Engineering Extraction AI.
    Your goal is to identify structural steel weights from the following text.
    
    PRIMARY TARGETS (High Priority):
    - "Thornton Tomasetti" or "TTE" Engineering Reports.
    - Look specifically for sketches labeled "SK-1", "SK-2", or "SK-3".
    - Look for "Structural Steel Tonnage" or "Reinforcing Tonnage".

    GENERAL TARGETS:
    - Look for phrases like "approx 17 tons", "estimated weight: 4500 lbs", etc.
    
    TEXT CHUNK:
    """
    ${textChunk}
    """
    
    Return a VALID JSON object matching this schema:
    {
      "weights": [
        { "value": 17, "unit": "tons", "context": "Primary header beam (TTE Report SK-1)", "confidence": 0.95 }
      ],
      "totalCalculatedWeight": 17
    }
    
    Strictly JSON. No markdown.
    `;

    try {
        const responseText = await llmCall(prompt);
        // Sanitize
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);

        // Validate with Zod
        return StructuralWeightSchema.parse(parsed);
    } catch (error) {
        console.error("Extraction Failed:", error);
        return { weights: [] };
    }
}

import { NextRequest, NextResponse } from "next/server";
import { queryVault } from "@/lib/anything-llm";
import { extractJson } from "@/lib/json-utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, targetFields } = body;

        const fields = Array.isArray(targetFields)
            ? targetFields.filter((f: unknown): f is string => typeof f === "string" && f.trim().length > 0)
            : [];

        if (typeof query !== "string" || query.trim().length === 0) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        if (fields.length === 0) {
            return NextResponse.json({ error: "targetFields is required" }, { status: 400 });
        }

        const workspace = process.env.ANYTHING_LLM_WORKSPACE || "anc-estimator";

        const getByPath = (obj: unknown, path: string) => {
            if (!obj || typeof obj !== "object") return undefined;
            return path.split(".").reduce<unknown>((acc, key) => {
                if (!acc || typeof acc !== "object") return undefined;
                return (acc as Record<string, unknown>)[key];
            }, obj);
        };


        const keysJson = JSON.stringify(fields);
        // Remove @agent to avoid raw tool calls leaking into the response
        // We rely on AnythingLLM's auto-detection or default behavior
        const prompt = `Search for the official corporate headquarters address and location details of "${query}". 
        
Return the results as a JSON object with these exact keys: ${keysJson}. 
Each value must be a string. If you cannot find a specific detail, return an empty string for that key.
Do not include any text other than the JSON object itself.

Example output format:
{
  "receiver.address": "123 Main St",
  "receiver.city": "New York",
  "receiver.zipCode": "10001",
  "details.venue": "Madison Square Garden"
}`;

        console.log(`[Enrich] Querying AnythingLLM for: ${query}`);
        const textResponse = await queryVault(workspace, prompt, "chat");
        console.log(`[Enrich] Raw response: ${textResponse}`);

        try {
            const jsonText = extractJson(textResponse);
            if (!jsonText) {
                return NextResponse.json({ ok: false, error: "AI response was not JSON" }, { status: 404 });
            }

            // Attempt to repair truncated JSON if it looks like a tool call or just broken
            let safeJsonText = jsonText
                .replace(/[“”]/g, '"')
                .replace(/[‘’]/g, "'");
            
            // Simple repair: if it ends with " or similar, try to close it
            // (This is a basic heuristic, better to rely on robust AI response)

            let parsed: unknown;
            try {
                parsed = JSON.parse(safeJsonText);
            } catch (e) {
                console.warn("[Enrich] JSON parse failed, trying to repair...", safeJsonText);
                // Try appending braces if it looks like it's missing them
                try {
                     parsed = JSON.parse(safeJsonText + "}");
                } catch (e2) {
                    try {
                        parsed = JSON.parse(safeJsonText + "}}");
                    } catch (e3) {
                         throw e; // Original error
                    }
                }
            }

            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                // Check if it's a tool call response that we should ignore or handle
                if ((parsed as any)?.name && (parsed as any)?.arguments) {
                     return NextResponse.json({ ok: false, error: "AI is performing a search, please try again in a moment." }, { status: 404 });
                }
                return NextResponse.json({ ok: false, error: "AI response was not an object" }, { status: 404 });
            }

            const resultsObj = parsed as Record<string, unknown>;
            const cleanedResults: Record<string, string> = {};
            for (const field of fields) {
                const direct = resultsObj[field];
                const nested = getByPath(resultsObj, field);
                const lastKey = field.includes(".") ? field.split(".").at(-1) : undefined;
                const shallow = lastKey ? resultsObj[lastKey] : undefined;

                const value = direct ?? nested ?? shallow;
                if (value === undefined || value === null) continue;
                const normalized = typeof value === "string" ? value.trim() : String(value).trim();
                if (normalized.length === 0) continue;
                cleanedResults[field] = normalized;
            }

            if (Object.keys(cleanedResults).length === 0) {
                return NextResponse.json({ ok: false, error: "AI could not find verified details" }, { status: 404 });
            }

            return NextResponse.json({ ok: true, results: cleanedResults });
        } catch (e) {
            console.error("AI Enrichment JSON Parse Error:", e);
        }

        return NextResponse.json({ ok: false, error: "AI could not find verified details" }, { status: 404 });
    } catch (error: any) {
        console.error("Enrichment API error:", error);
        return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
    }
}

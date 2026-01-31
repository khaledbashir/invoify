import { NextRequest, NextResponse } from "next/server";
import { ANYTHING_LLM_BASE_URL, ANYTHING_LLM_KEY } from "@/lib/variables";

/**
 * Dashboard Chat API Route - Intelligence Core
 * Connects to the unified "dashboard-vault" workspace
 * Supports thinking models with extended reasoning
 */
export async function POST(req: NextRequest) {
    try {
        const { message, workspace } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Always use dashboard-vault for cross-project intelligence
        const targetWorkspace = workspace || "dashboard-vault";

        if (!ANYTHING_LLM_BASE_URL || !ANYTHING_LLM_KEY) {
            return NextResponse.json({
                error: "AnythingLLM not configured",
                response: "The Intelligence Core is offline. Please configure ANYTHING_LLM credentials."
            }, { status: 500 });
        }

        console.log(`[Intelligence Core] Querying workspace: ${targetWorkspace}`);

        // Call AnythingLLM chat API
        const response = await fetch(`${ANYTHING_LLM_BASE_URL}/workspace/${targetWorkspace}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ANYTHING_LLM_KEY}`,
            },
            body: JSON.stringify({
                message,
                mode: "chat",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AnythingLLM error:", errorText);
            return NextResponse.json({
                error: "Failed to get response from AI",
                response: "I'm having trouble accessing the knowledge vault. Please ensure the dashboard-vault workspace exists in AnythingLLM."
            }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            response: data.textResponse || data.response || "No response received.",
            sources: data.sources || [],
            thinking: data.thinking || null, // If using thinking model
        });

    } catch (error: any) {
        console.error("Dashboard chat error:", error);
        return NextResponse.json({
            error: error.message,
            response: "An error occurred while processing your request. The Intelligence Core may be unreachable."
        }, { status: 500 });
    }
}

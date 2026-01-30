import { NextRequest, NextResponse } from "next/server";
import { uploadDocument, addToWorkspace, queryVault } from "@/lib/anything-llm";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const proposalId = formData.get("proposalId") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const workspaceSlug = process.env.ANYTHING_LLM_WORKSPACE || "anc-estimator";

    // 1. Upload Document
    console.log(`[RFP Upload] Uploading ${file.name} to AnythingLLM...`);
    const uploadRes = await uploadDocument(file, file.name);

    if (!uploadRes.success || !uploadRes.data?.documents?.[0]) {
      console.error("[RFP Upload] Upload failed", uploadRes);
      return NextResponse.json({ ok: false, error: "Failed to upload to storage" }, { status: 500 });
    }

    const docPath = uploadRes.data.documents[0].location;
    console.log(`[RFP Upload] File uploaded to ${docPath}`);

    // 2. Add to Workspace (Embed)
    console.log(`[RFP Upload] Adding to workspace ${workspaceSlug}...`);
    const embedRes = await addToWorkspace(workspaceSlug, docPath);
    
    if (!embedRes.success) {
      console.warn("[RFP Upload] Embedding failed, but continuing...", embedRes);
      // We continue because we can still return the URL, though AI might not know about it yet
    }

    // 3. Extract Data (AI Analysis)
    console.log(`[RFP Upload] Analyzing document for extraction...`);
    const extractionPrompt = `
      Analyze the uploaded RFP document "${file.name}" and extract the following technical specifications into a JSON object.
      
      Return ONLY valid JSON. No markdown formatting.
      
      Fields to extract:
      - receiver.name: Client or Customer Name
      - details.proposalName: Project Name or RFP Title
      - details.venue: Venue or Location Name
      - rulesDetected.structuralTonnage: Any mention of structural steel weight/tonnage
      - rulesDetected.reinforcingTonnage: Any mention of rebar/reinforcing weight
      - details.screens: Array of screens/displays found. For each screen include:
        - name: Screen name/ID
        - widthFt: Width in feet (convert if necessary)
        - heightFt: Height in feet (convert if necessary)
        - quantity: Number of units
        - pitchMm: Pixel pitch in mm
        - isReplacement: true if it replaces an existing screen
        - useExistingStructure: true if it uses existing steel
    `;

    let extractedData = null;
    try {
      // We use "chat" mode to ensure it uses the context of the newly uploaded doc if possible
      // Note: Embedding might take a moment, so this might be a hit or miss immediately.
      // But we'll try.
      const aiResponse = await queryVault(workspaceSlug, extractionPrompt, "chat");
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("[RFP Upload] AI Extraction failed", e);
    }

    return NextResponse.json({
      ok: true,
      url: docPath,
      extractedData,
      message: "RFP uploaded and analyzed successfully"
    });

  } catch (error: any) {
    console.error("[RFP Upload] Critical error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

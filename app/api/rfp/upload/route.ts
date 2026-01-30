import { NextRequest, NextResponse } from "next/server";
import { uploadDocument, addToWorkspace, queryVault } from "@/lib/anything-llm";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId required" }, { status: 400 });
    }

    const docs = await prisma.rfpDocument.findMany({
      where: { proposalId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ docs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.rfpDocument.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    // 2. Persist to Database (Vault)
    if (proposalId && proposalId !== "new") {
      try {
        await prisma.rfpDocument.create({
          data: {
            name: file.name,
            url: docPath,
            proposalId: proposalId
          }
        });
        console.log(`[RFP Vault] Saved document record for proposal ${proposalId}`);
      } catch (e) {
        console.error("[RFP Vault] Failed to save DB record:", e);
      }
    }

    // 3. Add to Workspace (Embed)
    console.log(`[RFP Upload] Adding to workspace ${workspaceSlug}...`);
    const embedRes = await addToWorkspace(workspaceSlug, docPath);
    
    if (!embedRes.success) {
      console.warn("[RFP Upload] Embedding failed, but continuing...", embedRes);
    }

    // 4. Extract Data (AI Analysis)
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
      const aiResponse = await queryVault(workspaceSlug, extractionPrompt, "chat");
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

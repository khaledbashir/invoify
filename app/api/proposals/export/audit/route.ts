import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFormulaicExcel } from "@/services/invoice/server/exportFormulaicExcel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const proposalId = body.proposalId;

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Prepare data for the formulaic engine
    // The engine expects an array of screens and global options
    const screens = (proposal as any).screens || [];
    const proposalName = proposal.proposalName || proposal.clientName || "Proposal";

    const workbook = await generateFormulaicExcel(screens, { proposalName });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${proposalName.replace(/\s+/g, '_')}_Audit.xlsx`,
      },
    });
  } catch (err) {
    console.error("Audit export error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
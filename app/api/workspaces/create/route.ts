import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ANYTHING_LLM_BASE_URL, ANYTHING_LLM_KEY } from "@/lib/variables";
import type { Workspace, User } from "@prisma/client";

// Define the intersection type that includes the users relation
type WorkspaceWithUsers = Workspace & {
  users: User[];
};

export interface CreateWorkspaceRequest {
  name: string;
  userEmail: string;
  createInitialProposal?: boolean;
  clientName?: string;
  calculationMode?: "MIRROR" | "STRATEGIC";
}

/**
 * POST /api/workspaces/create
 * Creates a new workspace and an initial project (proposal)
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkspaceRequest = await request.json();

    // 1. DATA VALIDATION
    if (!body.name || !body.userEmail) {
      return NextResponse.json(
        { error: "MISSION CRITICAL: Project Name and User Identity are required." },
        { status: 400 }
      );
    }

    // 2. PROJECT VAULT PERSISTENCE (Bulletproof)
    const workspace = await prisma.workspace.create({
      data: {
        name: body.name,
        users: {
          connectOrCreate: {
            where: { email: body.userEmail },
            create: { email: body.userEmail },
          },
        },
      },
    });

    let proposal: any = null;
    if (body.createInitialProposal) {
      proposal = await prisma.proposal.create({
        data: {
          workspaceId: workspace.id,
          clientName: body.clientName || body.name,
          status: "DRAFT",
          calculationMode: body.calculationMode === "MIRROR" ? "MIRROR" : "INTELLIGENCE",
        },
      });
    }

    // 3. AI PROVISIONING (Background/Ferrari Mode)
    const provisionAI = async () => {
      if (!ANYTHING_LLM_BASE_URL || !ANYTHING_LLM_KEY) return;

      try {
        // Create Unique Slug based on Project ID and Name
        const safeName = body.name.toLowerCase().replace(/[^a-z0-0]/g, '-').slice(0, 20);
        const uniqueSlug = `${safeName}-${workspace.id.slice(-6)}`;

        // v1/workspace/new is the proven endpoint
        const res = await fetch(`${ANYTHING_LLM_BASE_URL}/workspace/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ANYTHING_LLM_KEY}`
          },
          body: JSON.stringify({ name: uniqueSlug }),
        });

        if (res.ok) {
          const created = await res.json();
          const slug = created?.workspace?.slug || created?.slug;

          if (slug) {
            await prisma.workspace.update({
              where: { id: workspace.id },
              data: { aiWorkspaceSlug: slug },
            });

            // If proposal exists, update its local aiWorkspaceSlug reference too
            if (proposal) {
              await prisma.proposal.update({
                where: { id: proposal.id },
                data: { aiWorkspaceSlug: slug },
              });
            }

            // Provision Master Catalog (Background)
            const masterUrl = process.env.ANYTHING_LLM_MASTER_CATALOG_URL;
            if (masterUrl) {
              const { uploadLinkToWorkspace } = await import("@/lib/rag-sync");
              uploadLinkToWorkspace(slug, masterUrl).catch(console.error);
            }
          }
        }
      } catch (e) {
        console.warn("AI Strategic Provisioning Failed:", e);
      }
    };

    // Kick off without blocking the UI redirect
    provisionAI();

    // 4. STRATEGIC HANDOFF
    return NextResponse.json(
      {
        success: true,
        workspace,
        proposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CRITICAL VAULT FAILURE:", error);
    return NextResponse.json(
      {
        error: "Database Persistence Failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

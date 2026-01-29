import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    try {
        const project = await prisma.proposal.findUnique({
            where: { id },
            select: { shareHash: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        let shareHash = project.shareHash;

        if (!shareHash) {
            // Generate a unique 12-character hash for sharing
            shareHash = Math.random().toString(36).substring(2, 14);
            await prisma.proposal.update({
                where: { id },
                data: { shareHash }
            });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const shareUrl = `${baseUrl}/share/${shareHash}`;

        return NextResponse.json({ shareUrl });
    } catch (error) {
        console.error("POST /api/projects/[id]/share error:", error);
        return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
    }
}

import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ProposalTemplate2 from "@/app/components/templates/proposal-pdf/ProposalTemplate2";
import { ProposalType } from "@/types";
import LogoSelector from "@/app/components/reusables/LogoSelector";

const prisma = new PrismaClient();

async function getProjectByHash(hash: string) {
    const project = await prisma.proposal.findUnique({
        where: { shareHash: hash },
        include: {
            screens: {
                include: { lineItems: true }
            }
        }
    });

    if (!project) return null;

    // Map DB project to ProposalType
    // SECURITY: We do NOT pass internal audit or raw costs to the client view
    const mapped: Partial<ProposalType> = {
        receiver: {
            name: project.clientName,
            address: "",
            zipCode: "",
            city: "",
            country: "",
            email: "",
            phone: "",
            customInputs: []
        },
        sender: {
            name: "ANC Sports Enterprises",
            address: "2 Manhattanville Road, Suite 402",
            zipCode: "10577",
            city: "Purchase, NY",
            country: "United States",
            email: "info@ancsports.com",
            phone: "(914) 696-2100",
            customInputs: []
        },
        details: {
            proposalId: project.id,
            proposalName: project.clientName,
            proposalDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            items: [],
            currency: "USD",
            language: "English",
            taxDetails: { amount: 0, amountType: "amount", taxID: "" },
            discountDetails: { amount: 0, amountType: "amount" },
            shippingDetails: { cost: 0, costType: "amount" },
            paymentInformation: { bankName: "", accountName: "", accountNumber: "" },
            additionalNotes: "",
            paymentTerms: "Net 30",
            pdfTemplate: 2,
            screens: project.screens.map(s => ({
                id: s.id,
                name: s.name,
                pitchMm: s.pixelPitch,
                widthFt: s.width,
                heightFt: s.height,
                quantity: 1,
                // Do NOT include cost/margin in shared view
                lineItems: s.lineItems.map(li => ({
                    category: li.category,
                    price: li.price,
                    // Zero out sensitive data
                    cost: 0,
                    margin: 0
                }))
            })) as any,
            totalAmount: 0, // Will be calculated by template or passed
            totalAmountInWords: "",
            documentType: "First Round",
            pricingType: "Budget",
            proposalNumber: "",
            subTotal: 0,
            mirrorMode: false,
            calculationMode: "INTELLIGENCE"
        }
    };

    return mapped;
}

export default async function SharePage({ params }: { params: Promise<{ hash: string }> }) {
    const { hash } = await params;
    const project = await getProjectByHash(hash);

    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4">
            {/* Branding Header for Share View */}
            <div className="w-full max-w-[850px] flex justify-between items-center mb-8">
                <LogoSelector theme="light" width={140} height={50} />
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Portal</p>
                    <p className="text-xs font-medium text-slate-400">Secure Proposal View</p>
                </div>
            </div>

            {/* The Proposal Container */}
            <div className="w-full max-w-[850px] bg-white shadow-2xl min-h-[1100px]">
                <ProposalTemplate2 {...(project as ProposalType)} />
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                ANC Sports Enterprises • Proprietary & Confidential
            </div>
        </div>
    );
}

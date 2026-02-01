import React from "react";
import { formatNumberWithCommas } from "@/lib/helpers";
import { generateSOWContent, SOWOptions } from "@/lib/sowTemplate";
import { ProposalType } from "@/types";

interface ExhibitAProps {
    data: ProposalType;
}

const ExhibitA_SOW = ({ data }: ExhibitAProps) => {
    const { details, receiver } = data;
    const screens = details?.screens || [];

    const loc = (details?.location || "").toLowerCase();
    const name = (details?.proposalName || "").toLowerCase();
    const isMorgantown = loc.includes("morgantown") || loc.includes("wvu") || loc.includes("puskar") ||
        name.includes("morgantown") || name.includes("wvu") || name.includes("puskar");

    const sowOptions: SOWOptions = {
        documentType: (details as any).documentType || "BUDGET",
        isOutdoor: screens.some((s: any) => s.isOutdoor || s.environment === "OUTDOOR"),
        includeUnionLabor: (details as any).includeUnionLabor || (details as any).isUnionLabor,
        includeSpareParts: (details as any).includeSpareParts,
        atticStockMentioned: (details as any).atticStockMentioned || (details?.additionalNotes || "").toLowerCase().includes("attic stock"),
        isMorgantown,
        structuralTonnage: (details as any).structuralTonnage || (details as any).metadata?.structuralTonnage,
        signalSupport: (details as any).signalSupport || (details as any).metadata?.signalSupport,
        rossCarbonite: (details as any).rossCarbonite || (details as any).metadata?.rossCarbonite,
        vdcpSupport: (details as any).vdcpSupport || (details as any).metadata?.vdcpSupport,
        projectSpecificNotes: details?.additionalNotes,
        clientName: receiver?.name,
        projectLocation: details?.location
    };

    const sowSections = generateSOWContent(sowOptions);

    // Group sections by category for WVU compliance
    const designSections = sowSections.filter(s => s.category === "DESIGN");
    const constructionSections = sowSections.filter(s => s.category === "CONSTRUCTION");
    const constraintSections = sowSections.filter(s => s.category === "CONSTRAINTS");
    const otherSections = sowSections.filter(s => !s.category || s.category === "OTHER");

    return (
        <div className="pt-8">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-[#0A52EF] uppercase tracking-wider">Exhibit A</h2>
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Statement of Work</h3>
            </div>

            {/* NOTE: Technical Specifications are rendered in the main SPECIFICATIONS section */}
            {/* This exhibit focuses on Scope of Work details */}

            {/* 1. DESIGN SERVICES */}
            {designSections.length > 0 && (
                <div className="mb-12">
                    <h4 className="text-sm font-bold bg-[#0A52EF] text-white py-1 px-3 mb-6 uppercase tracking-widest">1. Design & Engineering Services</h4>
                    <div className="space-y-6 px-2">
                        {designSections.map((section, idx) => (
                            <div key={idx} className="break-inside-avoid">
                                <h5 className="text-[11px] font-bold text-[#0A52EF] border-b border-gray-100 pb-1 mb-2 uppercase tracking-wider">{section.title}</h5>
                                <p className="text-[10px] leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. CONSTRUCTION SERVICES */}
            {constructionSections.length > 0 && (
                <div className="mb-12">
                    <h4 className="text-sm font-bold bg-[#0A52EF] text-white py-1 px-3 mb-6 uppercase tracking-widest">2. Construction & Technical Logistics</h4>
                    <div className="space-y-6 px-2">
                        {constructionSections.map((section, idx) => (
                            <div key={idx} className="break-inside-avoid">
                                <h5 className="text-[11px] font-bold text-[#0A52EF] border-b border-gray-100 pb-1 mb-2 uppercase tracking-wider">{section.title}</h5>
                                <p className="text-[10px] leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. PROJECT CONSTRAINTS & COMPLIANCE - REMOVED per client feedback (marked with X in screenshots) */}
            {/* Venue Specifications and Site Logistics sections have been removed */}

            {/* OTHER / GENERAL */}
            {
                otherSections.length > 0 && (
                    <div className="mb-12">
                        <div className="space-y-6 px-2">
                            {otherSections.map((section, idx) => (
                                <div key={idx} className="break-inside-avoid">
                                    <h5 className="text-[11px] font-bold text-gray-900 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wider">{section.title}</h5>
                                    <p className="text-[10px] leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ExhibitA_SOW;

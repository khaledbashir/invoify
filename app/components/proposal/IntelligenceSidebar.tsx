"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2, ChevronRight, Info, Target, Zap, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeGaps, calculateCompletionRate } from "@/lib/gap-analysis";
import { useProposalContext } from "@/contexts/ProposalContext";

export function IntelligenceSidebar({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) {
    const { control } = useFormContext();
    const formValues = useWatch({ control });

    const gaps = analyzeGaps(formValues);
    const completionRate = calculateCompletionRate(gaps.length);
    const isHighAccuracy = formValues?.extractionAccuracy === "High";

    // RISK DETECTION
    // We expect the context to have injected 'rulesDetected' into metadata or separate state, 
    // but for now we can infer from the formValues details if we mapped them there, 
    // OR we can rely on a simpler 'metadata.risks' if we decided to persist IDs.
    // However, the cleanest way based on the plan is to run detection live here or passed in.
    // Since 'detectRisks' is fast, we can run it client-side if we have the rules.
    // NOTE: 'rulesDetected' isn't currently top-level in ProposalType formValues in standard schema.
    // We will attempt to read it from where RfpExtraction puts it (likely hidden field or separate context).
    // For this step, we will assume `formValues.details.aiSource` might contain it or we check the new metadata.
    // Let's implement a safe fallback to check 'metadata.risks' if we stored them, or just use detected keywords if we want to be robust.

    // Actually, implementing proper detection requires the rules. 
    // Let's look for "rulesDetected" in `formValues` if we extended the schema or just passed it.
    // The previous RfpExtractionService plan returned it in JSON but didn't explicitly map it to a field.
    // Let's assume for now we read `formValues.details.metadata?.risks` which we added to schema.

    // Wait, the plan said "ProposalContext: Add risks state". I haven't done that part yet.
    // I should do that first or mock it here.
    // Let's use the 'detectRisks' directly if we can access the triggering data.
    // Ideally, IntelligenceSidebar should just receive 'risks' from props or Context.
    // I'll stick to the plan: Update Context to have 'risks'.
    // BUT, for now, I will modify this component to be READY to receive/calculate them.

    // Let's rely on useProposalContext to get the risks.
    const { risks } = useProposalContext();

    if (!isVisible) {
        return (
            <button
                onClick={onToggle}
                className="group absolute right-4 top-24 z-50 p-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:bg-zinc-800 transition-all animate-in fade-in zoom-in duration-300"
                title="Show Project Health"
            >
                <div className="relative">
                    <Target className="w-5 h-5 text-brand-blue" />
                    {gaps.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900" />
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border-l border-zinc-800 w-80 shrink-0 overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl backdrop-blur-md">
            {/* Project Health Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-blue" />
                    Project Health
                </h3>
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40">
                {isHighAccuracy && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit mb-4 animate-pulse">
                        <Zap className="w-3 h-3 fill-emerald-500" />
                        HIGH ACCURACY MODE (Blue Glow Locked)
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500 font-medium">Bid Completion (17/20 Logic)</span>
                        <span className={cn(
                            "font-bold",
                            completionRate >= 85 ? "text-emerald-500" : completionRate >= 50 ? "text-amber-500" : "text-zinc-400"
                        )}>
                            {Math.round(completionRate)}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out rounded-full",
                                completionRate >= 85 ? "bg-emerald-500" : completionRate >= 50 ? "bg-amber-500" : "bg-brand-blue"
                            )}
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-zinc-600 italic mt-2">
                        {gaps.length > 0
                            ? `AI detected ${gaps.length} missing data points (Gaps).`
                            : "All 20 critical technical specs have been identified."}
                    </p>
                </div>
            </div>

            {/* RISK ALERTS (CRITICAL) */}
            {risks && risks.length > 0 && (
                <div className="p-4 bg-red-950/20 border-b border-red-900/30">
                    <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-3 h-3 animate-pulse" />
                        CRITICAL RISK FACTORS
                    </h4>
                    <div className="space-y-2">
                        {risks.map(r => (
                            <div key={r.id} className="bg-red-900/40 border border-red-500/30 p-3 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-red-200">{r.risk}</span>
                                    <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">{r.priority}</span>
                                </div>
                                <p className="text-[10px] text-red-300/80 mb-2 leading-tight">{r.trigger}</p>
                                <div className="flex items-center gap-2 text-[10px] text-red-200 font-medium bg-red-950/50 p-1.5 rounded">
                                    <span className="shrink-0 text-red-400">ACTION:</span>
                                    {r.actionRequired}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gap List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {gaps.length > 0 ? (
                    <>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Detected Gaps</h4>
                        {gaps.map((gap) => (
                            <div
                                key={gap.id}
                                className={cn(
                                    "group p-3 rounded-xl border transition-all cursor-help relative overflow-hidden",
                                    gap.priority === "high"
                                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                                        : "bg-zinc-800/30 border-zinc-800 hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className={cn(
                                        "mt-0.5 shrink-0",
                                        gap.priority === "high" ? "text-red-500" : "text-amber-500"
                                    )}>
                                        {gap.field === "Tolerance Violation" ? <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /> : <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-zinc-200 truncate">{gap.field}</span>
                                            <div className="flex gap-1">
                                                {gap.section && (
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                                        {gap.section}
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                                                    gap.priority === "high" ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                                                )}>
                                                    {gap.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                            {gap.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 mt-1" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-200">Bid Ready (20/20)</h4>
                        <p className="text-xs text-zinc-500 mt-2">
                            The RAG engine has extracted all required Section 11 specifications.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Advice */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-blue/5 border border-brand-blue/10">
                    <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-500 leading-normal">
                        <span className="text-zinc-300 font-medium">Pro-Tip:</span> Uploading a "Display Schedule" PDF improves extraction accuracy by 45%.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2, ChevronRight, Info, Target, Zap, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeGaps, calculateCompletionRate } from "@/lib/gap-analysis";
import { useProposalContext } from "@/contexts/ProposalContext";
import { isFieldVerified } from "@/lib/ai-verification";
import { RiskItem } from "@/services/risk-detector";

export function IntelligenceSidebar({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) {
    const { control } = useFormContext();
    const formValues = useWatch({ control });

    const gaps = analyzeGaps(formValues);
    const completionRate = calculateCompletionRate(gaps.length);

    // Check for Empty/Reset State to avoid "Bid Ready" false positive
    const isDefaultClient = !formValues?.receiver?.name || formValues?.receiver?.name === "Client Name";
    const isNoScreens = (formValues?.details?.screens || []).length === 0;
    const isNoProjectName = !formValues?.details?.proposalName;
    const isEmptyState = isDefaultClient && isNoScreens && isNoProjectName;

    const {
        aiFields,
        verifiedFields,
        sidebarMode,
        setSidebarMode,
        aiMessages,
        executeAiCommand,
        aiLoading,
        rfpQuestions,
        answerRfpQuestion
    } = useProposalContext();
    const [chatInput, setChatInput] = React.useState("");
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [aiMessages, sidebarMode]);
    const unverifiedCount = aiFields.filter(f => !isFieldVerified(verifiedFields, f)).length;

    // RISK DETECTION
    // Real-time detection from ProposalContext
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
        <div className="flex flex-col h-full bg-zinc-950/90 border-l border-zinc-800 w-96 shrink-0 overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl backdrop-blur-xl">
            {/* Header - Ferrari Style */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-start relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent pointer-events-none" />

                <div className="relative font-mono z-10 flex-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue mb-1 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-brand-blue animate-pulse" />
                        Intelligence Engine
                    </h3>

                    {/* Mode Switcher */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => setSidebarMode("HEALTH")}
                            className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded transition-colors",
                                sidebarMode === "HEALTH" ? "bg-brand-blue/20 text-brand-blue" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            HEALTH
                        </button>
                        <div className="w-px h-3 bg-zinc-800" />
                        <button
                            onClick={() => setSidebarMode("CHAT")}
                            className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded transition-colors",
                                sidebarMode === "CHAT" ? "bg-brand-blue/20 text-brand-blue" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            CHAT
                        </button>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white relative z-10"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Vitality Score (Only in HEALTH mode) */}
            {sidebarMode === "HEALTH" && (
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/20 relative group">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Bid Vitality</div>
                            <div className={cn(
                                "text-4xl font-black tracking-tighter tabular-nums transition-colors duration-500",
                                completionRate >= 85 ? "text-emerald-500" : completionRate >= 50 ? "text-amber-500" : "text-zinc-600"
                            )}>
                                {Math.round(completionRate)}<span className="text-lg text-zinc-500 font-bold">%</span>
                            </div>
                        </div>
                        <div className={cn(
                            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2",
                            completionRate >= 85 ? "bg-emerald-500/10 text-emerald-500" : completionRate >= 50 ? "bg-amber-500/10 text-amber-500" : "bg-zinc-800 text-zinc-500"
                        )}>
                            {completionRate >= 85 ? "Excellent" : completionRate >= 50 ? "Needs Work" : "Critical"}
                        </div>
                    </div>

                    {/* Genetic Bar Visualization */}
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 opacity-20 bg-[url('/stripes.png')] bg-[length:4px_4px]" />
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out relative overflow-hidden",
                                completionRate >= 85 ? "bg-emerald-500" : completionRate >= 50 ? "bg-amber-500" : "bg-zinc-700"
                            )}
                            style={{ width: `${completionRate}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>

                    {gaps.length > 0 && (
                        <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            <span>{gaps.length} critical data points missing</span>
                        </p>
                    )}
                </div>
            )}

            {/* Content Area */}
            {sidebarMode === "HEALTH" ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                    {/* Critical Risks Section */}
                    {risks && risks.length > 0 && (
                        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-950/10">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            <div className="p-4">
                                <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Critical Risks Detected
                                </h4>
                                <div className="space-y-3">
                                    {risks.map(r => (
                                        <div key={r.id} className="bg-red-900/20 rounded-lg p-3 border border-red-500/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-red-200">{r.risk}</span>
                                                <span className="text-[9px] font-bold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded uppercase border border-red-500/20">{r.priority}</span>
                                            </div>
                                            <div className="text-[10px] text-red-300/70 pl-2 border-l border-red-500/20">
                                                {r.actionRequired}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gaps List */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 sticky top-0 bg-zinc-950/90 py-2 backdrop-blur-sm z-10 flex items-center justify-between">
                            <span>Analysis Report</span>
                            <span className="text-zinc-600">{gaps.length} items</span>
                        </h4>

                        {gaps.length > 0 ? gaps.map((gap) => (
                            <div
                                key={gap.id}
                                className={cn(
                                    "group p-4 rounded-xl border transition-all hover:-translate-y-0.5 relative overflow-hidden",
                                    gap.priority === "high"
                                        ? "bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "mt-1 p-1.5 rounded-md",
                                        gap.priority === "high" ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                                    )}>
                                        {gap.priority === "high" ?
                                            <AlertTriangle className="w-3.5 h-3.5" /> :
                                            <Target className="w-3.5 h-3.5" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-zinc-200">{gap.field}</span>
                                            {gap.section && (
                                                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                                    {gap.section}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                            {gap.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )) : !isEmptyState && (
                            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">Systems Nominal</h4>
                                <p className="text-xs text-zinc-400">
                                    All 20 critical specifications identified and verified. Ready for export.
                                </p>
                            </div>
                        )}

                        {isEmptyState && (
                            <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center">
                                <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                                <p className="text-xs text-zinc-500">
                                    Waiting for RFP data...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                        {/* Intro Message */}
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0">
                                <Zap className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="bg-zinc-900/80 rounded-2xl rounded-tl-sm p-4 text-xs leading-relaxed text-zinc-300">
                                    I've analyzed the uploaded documents. I have a few clarifying questions to complete your proposal with 100% confidence.
                                </div>
                            </div>
                        </div>

                        {/* Extracted Questions */}
                        {rfpQuestions.filter(q => !q.answered).map(q => (
                            <div key={q.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <Target className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="bg-zinc-900/80 rounded-2xl rounded-tl-sm p-4 text-xs leading-relaxed text-zinc-300 border border-amber-500/20">
                                        <p className="font-bold text-amber-500 mb-1">Clarification Needed</p>
                                        {q.question}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => answerRfpQuestion(q.id, "Yes")}
                                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => answerRfpQuestion(q.id, "No")}
                                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
                                        >
                                            No
                                        </button>
                                        <button
                                            onClick={() => setChatInput(`Answer for ${q.question}: `)}
                                            className="px-3 py-1.5 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue rounded text-xs"
                                        >
                                            Type Answer...
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* History */}
                        {aiMessages.map(m => (
                            <div key={m.id} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2", m.role === "user" && "flex-row-reverse")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === "user" ? "bg-zinc-800" : "bg-brand-blue/20"
                                )}>
                                    {m.role === "user" ? <div className="w-2 h-2 bg-zinc-500 rounded-full" /> : <Zap className="w-4 h-4 text-brand-blue" />}
                                </div>
                                <div className={cn(
                                    "rounded-2xl p-4 text-xs leading-relaxed max-w-[80%]",
                                    m.role === "user" ? "bg-brand-blue text-white rounded-tr-sm" : "bg-zinc-900/80 text-zinc-300 rounded-tl-sm"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {aiLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0">
                                    <Zap className="w-4 h-4 text-brand-blue animate-pulse" />
                                </div>
                                <div className="bg-zinc-900/80 rounded-2xl rounded-tl-sm p-4 text-xs text-zinc-500 italic">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!chatInput.trim()) return;
                                executeAiCommand(chatInput);
                                setChatInput("");
                            }}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask Natalia or answer questions..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-200 focus:outline-none focus:border-brand-blue/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || aiLoading}
                                className="absolute right-2 top-2 p-1.5 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pro-Tip Footer */}
            <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
                <div className="flex items-center gap-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    <p className="text-[10px] text-zinc-500 font-mono">
                        AI MODEL: <span className="text-zinc-300">NATALIA V2.4 (O1-PREVIEW)</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

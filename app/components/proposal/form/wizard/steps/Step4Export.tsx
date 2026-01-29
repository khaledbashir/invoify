"use client";

import { useState } from "react";
import { useProposalContext } from "@/contexts/ProposalContext";
import { useFormContext } from "react-hook-form";
import {
    FileDown,
    Printer,
    Eye,
    CheckCircle2,
    Share2,
    Mail,
    Clock,
    ArrowLeft,
    Copy,
    Check,
    FileSpreadsheet,
    Shield,
    AlertTriangle,
    Zap,
    Download,
    Lock
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseButton } from "@/app/components";
import { formatCurrency } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const Step4Export = () => {
    const {
        downloadPdf,
        printPdf,
        previewPdfInTab,
        saveProposalData,
        sendPdfToMail,
        exportAudit
    } = useProposalContext();
    const { watch } = useFormContext();
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Get proposal data
    const screens = watch("details.screens") || [];
    const internalAudit = watch("details.internalAudit");
    const proposalName = watch("details.proposalName") || "Untitled Proposal";
    const proposalId = watch("details.proposalId");
    const totalValue = internalAudit?.totals?.finalClientTotal || 0;
    const lastSaved = watch("lastSavedAt");
    const mirrorMode = watch("details.mirrorMode");

    const screenCount = screens.length;
    const hasErrors = screens.some((s: any) => !s.widthFt || !s.heightFt || !s.name);
    const allScreensValid = screenCount > 0 && !hasErrors;

    const handleGlobalExport = async () => {
        setExporting(true);
        try {
            // Trigger both exports as requested
            await downloadPdf();
            await exportAudit();
        } finally {
            setTimeout(() => setExporting(false), 2000);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Phase 4 Header */}
            <div className="flex flex-col items-center text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 relative group">
                    <div className="absolute inset-0 bg-brand-blue/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <Zap className="w-8 h-8 text-brand-blue relative z-10" />
                </div>
                
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Validation & Final Export</h2>
                <p className="text-zinc-500 text-sm max-w-md font-medium">
                    Review your strategic analysis and generate professional-grade project artifacts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Left Column: Summary & Status */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative">
                        {/* 55° Slash Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full transform rotate-[55deg] translate-x-8 -translate-y-8 bg-gradient-to-b from-brand-blue to-transparent" />
                        </div>

                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Project Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate">{proposalName}</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest">
                                        {screenCount} Screens
                                    </Badge>
                                    <Badge className="bg-brand-blue/10 text-brand-blue border-none text-[10px] font-bold uppercase tracking-widest">
                                        {formatCurrency(totalValue)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 font-medium">Calculation Mode</span>
                                    <span className="text-zinc-300 font-bold">{mirrorMode ? "Mirror Mode" : "Strategic AI"}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 font-medium">Data Integrity</span>
                                    {allScreensValid ? (
                                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-amber-500 font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Issues Found
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-zinc-600" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last Vault Sync</span>
                            <span className="text-xs text-zinc-400 font-medium">{lastSaved ? new Date(lastSaved).toLocaleTimeString() : "Pending sync..."}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Global Export Action */}
                <div className="lg:col-span-2 space-y-6">
                    {/* The Global Export Button - Primary Call to Action */}
                    <div 
                        onClick={allScreensValid ? handleGlobalExport : undefined}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl p-10 transition-all duration-500",
                            allScreensValid 
                                ? "bg-brand-blue cursor-pointer hover:shadow-[0_0_40px_rgba(10,82,239,0.3)] hover:-translate-y-1" 
                                : "bg-zinc-800/50 cursor-not-allowed opacity-60"
                        )}
                    >
                        {/* 55° Slash Pattern for Brand Consistency */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="absolute h-[200%] w-px bg-white transform rotate-[55deg]"
                                    style={{ left: `${i * 20}%`, top: '-50%' }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                {exporting ? (
                                    <Zap className="w-10 h-10 text-white animate-pulse" />
                                ) : (
                                    <Download className="w-10 h-10 text-white" />
                                )}
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Global Export Bundle</h3>
                                <p className="text-white/70 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                    Generates both the <span className="text-white font-bold">Client-Facing PDF</span> and the <span className="text-white font-bold">Internal Audit Excel</span> in a single operation.
                                </p>
                            </div>

                            {!allScreensValid && (
                                <div className="mt-2 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Complete All Steps to Unlock
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary Artifact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={previewPdfInTab}
                            className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-brand-blue/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-brand-blue transition-colors">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-white">Live PDF Preview</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium">Verify layout before export</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-zinc-700 group-hover:text-brand-blue rotate-180 transition-all" />
                        </button>

                        <button 
                            onClick={exportAudit}
                            className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-white">Audit Security Blanket</h4>
                                    <p className="text-[10px] text-zinc-500 font-medium">Excel with hidden formulas</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 rotate-180 transition-all" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Support Footer */}
            <div className="mt-auto pt-8 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">ANC Identity Protection System Active</span>
                </div>
                <div className="text-[10px] font-medium text-zinc-600">
                    For branding approvals, contact <span className="text-zinc-500 underline">alison@anc.com</span>
                </div>
            </div>
        </div>
    );
};

export default Step4Export;
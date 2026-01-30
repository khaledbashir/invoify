"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Calculator, FileText, Wand2, Sparkles, Box, Info, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Screens } from "@/app/components";
import { Badge } from "@/components/ui/badge";
import { useProposalContext } from "@/contexts/ProposalContext";

const Step2Intelligence = () => {
    const { aiWorkspaceSlug } = useProposalContext();
    const { control } = useFormContext();
    const screens = useWatch({
        name: "details.screens",
        control
    }) || [];

    const screenCount = screens.length;
    const hasData = aiWorkspaceSlug || screenCount > 0;

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Intelligence Briefing */}
            {hasData ? (
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <Sparkles className="w-24 h-24 text-brand-blue" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-brand-blue text-white hover:bg-brand-blue/90 px-3 py-1">
                                <Sparkles className="w-3 h-3 mr-1.5 fill-white" />
                                Project Data Loaded
                            </Badge>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white mb-2">Display Schedule Analysis</h2>
                        <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                            {aiWorkspaceSlug ? (
                                <>I've analyzed the uploaded RFP documents and Excel data. I found <span className="text-white font-semibold underline decoration-brand-blue/50">{screenCount} video screens</span> across the project. Should I proceed with <span className="text-brand-blue font-bold">Standard</span> or <span className="text-brand-blue font-bold">Premium</span> product catalogs for these specifications?</>
                            ) : (
                                <>I've detected <span className="text-white font-semibold underline decoration-brand-blue/50">{screenCount} screen configurations</span> in your draft. I can help you optimize these specs or apply product catalogs from <span className="text-brand-blue font-bold">Standard</span> or <span className="text-brand-blue font-bold">Premium</span> vendors.</>
                            )}
                        </p>
                        
                        <div className="flex gap-3 mt-6">
                            <button disabled className="px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-sm font-medium text-zinc-500 cursor-not-allowed flex items-center gap-2">
                                <Box className="w-4 h-4 text-zinc-600" />
                                Use Standard Catalog (Coming Soon)
                            </button>
                            <button disabled className="px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-sm font-medium text-zinc-500 cursor-not-allowed flex items-center gap-2">
                                <Box className="w-4 h-4 text-zinc-600" />
                                Use Premium Catalog (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-zinc-800/50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-zinc-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">No Data Detected</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            The Intelligence Engine hasn't received any data yet. Please upload an RFP in Step 1 or start adding screens below.
                        </p>
                    </div>
                </div>
            )}

            <Card className="bg-zinc-900/50 border-zinc-800/50 flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-3 shrink-0 border-b border-zinc-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-brand-blue/20">
                                <Calculator className="w-5 h-5 text-brand-blue" />
                            </div>
                            <div>
                                <CardTitle className="text-zinc-100 text-base">Drafting Table: Screen Configurations</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs">Define technical specifications for the display system.</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            <Info className="w-3 h-3" />
                            Auto-syncing to PDF Anchor
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                    <div className="p-6">
                        <Screens />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Step2Intelligence;

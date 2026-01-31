"use client";

import React, { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    AlertCircle,
    CheckCircle2,
    X,
    AlertTriangle,
    Zap,
    Upload,
    FileText,
    Loader2,
    Send,
    Trash2,
    Target,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeGaps, calculateCompletionRate } from "@/lib/gap-analysis";
import { useProposalContext } from "@/contexts/ProposalContext";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: any[];
}

interface UploadedDoc {
    name: string;
    url: string;
    uploadedAt: Date;
}

export function IntelligenceSidebar({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) {
    const { control } = useFormContext();
    const formValues = useWatch({ control });
    const { risks } = useProposalContext();

    const gaps = analyzeGaps(formValues);
    const completionRate = calculateCompletionRate(gaps.length);

    const isDefaultClient = !formValues?.receiver?.name || formValues?.receiver?.name === "Client Name";
    const isNoScreens = (formValues?.details?.screens || []).length === 0;
    const isNoProjectName = !formValues?.details?.proposalName;
    const isEmptyState = isDefaultClient && isNoScreens && isNoProjectName;

    const [sidebarMode, setSidebarMode] = React.useState<"HEALTH" | "CHAT">("HEALTH");
    const [messages, setMessages] = React.useState<Message[]>([{
        id: "welcome",
        role: "assistant",
        content: "I'm your AI proposal assistant. Upload an RFP or spec doc, and I'll help you extract requirements, answer questions, and fill gaps."
    }]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [uploadedDocs, setUploadedDocs] = React.useState<UploadedDoc[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("proposalId", formValues?.details?.proposalId || "new");

            const response = await fetch("/api/rfp/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.ok) {
                const newDoc: UploadedDoc = {
                    name: file.name,
                    url: data.url,
                    uploadedAt: new Date(),
                };
                setUploadedDocs(prev => [...prev, newDoc]);

                // Auto-switch to chat and send confirmation message
                setSidebarMode("CHAT");
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `✅ **${file.name}** uploaded successfully! I've analyzed it and embedded it in the knowledge base. Ask me anything about this document.`
                }]);

                // If extracted data exists, show it
                if (data.extractedData) {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `I found some key details:\n\n${JSON.stringify(data.extractedData, null, 2)}\n\nWould you like me to auto-fill these into the proposal?`
                    }]);
                }
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: `❌ Upload failed: ${error.message}`
            }]);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "user",
            content: userMessage
        }]);

        setIsLoading(true);

        try {
            // Use the project's workspace if available
            const workspaceSlug = formValues?.aiWorkspaceSlug || "anc-estimator";

            const response = await fetch("/api/dashboard/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    workspace: workspaceSlug
                }),
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response || "No response received.",
                sources: data.sources
            }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const removeDoc = (index: number) => {
        setUploadedDocs(prev => prev.filter((_, i) => i !== index));
    };

    if (!isVisible) {
        return (
            <button
                onClick={onToggle}
                className="group absolute right-4 top-24 z-50 p-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:bg-zinc-800 transition-all animate-in fade-in zoom-in duration-300"
                title="Show Intelligence Panel"
            >
                <div className="relative">
                    <Zap className="w-5 h-5 text-[#0A52EF]" />
                    {gaps.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900" />
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#09090b] border-l border-zinc-800 w-96 shrink-0 overflow-hidden animate-in slide-in-from-right duration-300 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#0A52EF]/10 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#0A52EF]" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Intelligence Panel</h3>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSidebarMode("HEALTH")}
                        className={cn(
                            "flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all",
                            sidebarMode === "HEALTH"
                                ? "bg-[#0A52EF]/20 text-[#0A52EF] border border-[#0A52EF]/30"
                                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Health
                    </button>
                    <button
                        onClick={() => setSidebarMode("CHAT")}
                        className={cn(
                            "flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all",
                            sidebarMode === "CHAT"
                                ? "bg-[#0A52EF]/20 text-[#0A52EF] border border-[#0A52EF]/30"
                                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Ask AI
                        {uploadedDocs.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-[#0A52EF] text-white rounded text-[9px]">
                                {uploadedDocs.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {sidebarMode === "HEALTH" ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {/* Vitality Score */}
                    <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50">
                        <div className="flex items-end justify-between mb-3">
                            <div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Bid Health</div>
                                <div className={cn(
                                    "text-3xl font-black",
                                    completionRate >= 85 ? "text-emerald-500" : completionRate >= 50 ? "text-amber-500" : "text-zinc-600"
                                )}>
                                    {Math.round(completionRate)}<span className="text-lg text-zinc-500">%</span>
                                </div>
                            </div>
                            <div className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded uppercase",
                                completionRate >= 85 ? "bg-emerald-500/10 text-emerald-500" : completionRate >= 50 ? "bg-amber-500/10 text-amber-500" : "bg-zinc-800 text-zinc-500"
                            )}>
                                {completionRate >= 85 ? "Ready" : completionRate >= 50 ? "Needs Work" : "Critical"}
                            </div>
                        </div>
                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    completionRate >= 85 ? "bg-emerald-500" : completionRate >= 50 ? "bg-amber-500" : "bg-zinc-700"
                                )}
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Risks */}
                    {risks && risks.length > 0 && (
                        <div className="border border-red-500/20 rounded-xl bg-red-950/10 p-4">
                            <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                Critical Risks
                            </h4>
                            <div className="space-y-2">
                                {risks.map(r => (
                                    <div key={r.id} className="bg-red-900/20 rounded-lg p-3 border border-red-500/10 text-xs">
                                        <div className="font-bold text-red-200 mb-1">{r.risk}</div>
                                        <div className="text-red-300/70 text-[10px]">{r.actionRequired}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gaps */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Gaps ({gaps.length})
                        </h4>
                        {gaps.length > 0 ? gaps.map(gap => (
                            <div
                                key={gap.id}
                                className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    gap.priority === "high"
                                        ? "bg-red-500/10 border-red-500/20"
                                        : "bg-zinc-900/50 border-zinc-800"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "mt-1 p-1.5 rounded-md",
                                        gap.priority === "high" ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                                    )}>
                                        <Target className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-zinc-200 mb-1">{gap.field}</div>
                                        <p className="text-[11px] text-zinc-400">{gap.description}</p>
                                    </div>
                                </div>
                            </div>
                        )) : !isEmptyState && (
                            <div className="p-6 border border-emerald-500/20 rounded-xl bg-emerald-500/10 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <div className="text-sm font-bold text-white mb-1">All Systems Nominal</div>
                                <p className="text-xs text-zinc-400">Ready for export</p>
                            </div>
                        )}

                        {isEmptyState && (
                            <div className="p-6 border border-dashed border-zinc-800 rounded-xl text-center">
                                <Info className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                                <p className="text-xs text-zinc-500">Waiting for RFP data...</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Document Upload Section */}
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full px-4 py-3 bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-[#0A52EF]/50 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading & Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload RFP or Spec Doc</span>
                                </>
                            )}
                        </button>

                        {/* Uploaded Docs List */}
                        {uploadedDocs.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {uploadedDocs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <FileText className="w-4 h-4 text-[#0A52EF]" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-zinc-300 truncate">{doc.name}</div>
                                            <div className="text-[9px] text-zinc-600">{doc.uploadedAt.toLocaleTimeString()}</div>
                                        </div>
                                        <button
                                            onClick={() => removeDoc(idx)}
                                            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === "user" ? "bg-zinc-800" : "bg-[#0A52EF]/20"
                                )}>
                                    {msg.role === "user" ? (
                                        <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                                    ) : (
                                        <Zap className="w-4 h-4 text-[#0A52EF]" />
                                    )}
                                </div>
                                <div className={cn(
                                    "rounded-2xl p-3 text-xs leading-relaxed max-w-[80%]",
                                    msg.role === "user"
                                        ? "bg-[#0A52EF] text-white rounded-tr-sm"
                                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm prose prose-invert prose-sm max-w-none"
                                )}>
                                    {msg.role === "assistant" ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0A52EF]/20 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 text-[#0A52EF] animate-spin" />
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-3 text-xs text-zinc-500">
                                    Analyzing...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="relative"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={uploadedDocs.length > 0 ? "Ask about the documents..." : "Upload a doc first to start chatting"}
                                disabled={isLoading}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#0A52EF]/50 transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-2 p-1.5 bg-[#0A52EF] text-white rounded-lg hover:bg-[#0A52EF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

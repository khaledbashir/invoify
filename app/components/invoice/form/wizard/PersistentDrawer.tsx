"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FileText, Bot, X, ChevronRight, ChevronLeft } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/app/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RFPQuestionsPanel } from "@/app/components/RFPQuestionsPanel"; // Assuming this is the chat?

interface PersistentDrawerProps {
    isOpen: boolean;
    onToggle: () => void;
    activeMode: "pdf" | "chat";
    setActiveMode: (mode: "pdf" | "chat") => void;
}

const PersistentDrawer = ({ isOpen, onToggle, activeMode, setActiveMode }: PersistentDrawerProps) => {
    return (
        <div
            className={cn(
                "fixed top-0 right-0 h-screen bg-zinc-950 border-l border-zinc-800 shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col",
                isOpen ? "w-[600px] translate-x-0" : "w-[600px] translate-x-full" // Fixed width for drawer
            )}
        >
            {/* Toggle Handle (Visible when closed? No, usually a button on main UI triggers it. But maybe a tab sticking out?) 
                Actually, simpler to have a dedicated toggle button floating or attached.
            */}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
                <Tabs value={activeMode} onValueChange={(v: string) => setActiveMode(v as any)} className="w-full">
                    <TabsList className="grid w-[300px] grid-cols-2">
                        <TabsTrigger value="pdf" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Live Preview
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="gap-2">
                            <Bot className="w-4 h-4" />
                            Intelligence
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon" onClick={onToggle} className="ml-2 text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-zinc-950/50 p-4">
                {activeMode === "pdf" && (
                    <div className="h-full flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-300">Real-Time PDF Preview</h3>
                            <span className="text-xs text-zinc-500">Auto-updates with changes</span>
                        </div>
                        {/* We wrap PdfViewer to fit */}
                        <div className="flex-1 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
                            {/* Scale down slightly if needed */}
                            <div className="origin-top scale-[0.65] w-[150%] h-[150%] -ml-[25%] -mt-[10%]">
                                <PdfViewer />
                            </div>
                        </div>
                    </div>
                )}

                {activeMode === "chat" && (
                    <div className="h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-zinc-300">Project Intelligence</h3>
                            <p className="text-xs text-zinc-500">Ask questions about the RFP or Master Catalog.</p>
                        </div>
                        <div className="flex-1">
                            <RFPQuestionsPanel />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersistentDrawer;

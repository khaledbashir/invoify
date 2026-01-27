"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Icons
import { PenLine, Bot } from "lucide-react";

type Mode = "form" | "ai";

interface ModeToggleProps {
    mode: Mode;
    onChange: (mode: Mode) => void;
}

/**
 * ModeToggle - Pill-style toggle for switching between Drafting Form and Intelligence Engine
 * 
 * Uses French Blue (#0A52EF) for active state
 * Zero-lag switching via parent state
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
    return (
        <div className="flex items-center justify-center p-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="inline-flex rounded-full bg-zinc-800 p-1">
                <button
                    type="button"
                    onClick={() => onChange("form")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
                        mode === "form"
                            ? "bg-[#0A52EF] text-white shadow-lg"
                            : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                    <PenLine className="w-4 h-4" />
                    Drafting
                </button>
                <button
                    type="button"
                    onClick={() => onChange("ai")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150",
                        mode === "ai"
                            ? "bg-[#0A52EF] text-white shadow-lg"
                            : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                    <Bot className="w-4 h-4" />
                    Intelligence
                </button>
            </div>
        </div>
    );
}

export default ModeToggle;

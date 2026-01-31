"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    Sparkles,
    X,
    Maximize2,
    Minimize2,
    Command,
    Terminal,
    Search,
    Plus,
    Mic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: "user", content: input }]);
        setInput("");
        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: "I'm analyzing the vault for tactical insights. What specific project detail can I assist with?" }]);
        }, 1000);
    };

    return (
        <div className="relative w-full">
            {/* Chat Expanded Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="absolute bottom-20 left-0 right-0 max-h-[400px] mb-4 bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-4 z-50 pointer-events-auto"
                    >
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-12">
                                    <Sparkles className="w-8 h-8 text-[#0A52EF]" />
                                    <p className="text-sm font-medium max-w-[200px]">
                                        Ask me anything about your proposals, budgets, or strategy.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className={cn(
                                        "flex flex-col max-w-[85%] space-y-1",
                                        msg.role === "user" ? "ml-auto items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-[#0A52EF] text-white"
                                                : "bg-zinc-900 border border-zinc-800 text-zinc-300"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Command Bar */}
            <div className={cn(
                "w-full h-14 bg-[#09090b]/90 backdrop-blur-3xl border border-zinc-800 rounded-xl flex items-center px-4 transition-all duration-300 pointer-events-auto",
                isOpen ? "ring-2 ring-[#0A52EF]/30 border-[#0A52EF]/50" : "hover:border-zinc-600"
            )}>
                <div className="flex items-center gap-3 mr-4">
                    <Command className="w-4 h-4 text-zinc-600" />
                    <div className="w-px h-6 bg-zinc-800" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-700"
                />

                <div className="flex items-center gap-2 ml-4">
                    {!input && (
                        <div className="flex gap-2 mr-2">
                            <div className="px-1.5 py-0.5 border border-zinc-800 rounded text-[9px] font-bold text-zinc-600">CMD</div>
                            <div className="px-1.5 py-0.5 border border-zinc-800 rounded text-[9px] font-bold text-zinc-600">K</div>
                        </div>
                    )}
                    <button className="p-2 text-zinc-600 hover:text-zinc-200 transition-colors">
                        <Mic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSend}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            input ? "text-[#0A52EF] hover:bg-[#0A52EF]/10" : "text-zinc-700 pointer-events-none"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

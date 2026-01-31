"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Loader2, Building2, X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
};

const QUICK_PROMPTS = [
    { label: "Active Projects", prompt: "List all active projects and their current status" },
    { label: "Revenue Summary", prompt: "What's the total estimated revenue across all proposals?" },
    { label: "Pending Items", prompt: "Which projects have pending issues or gaps?" },
];

/**
 * DashboardChat - Premium Business Intelligence AI Chat
 * 
 * Features:
 * - Glassmorphism panel styling
 * - Animated floating action button with glow
 * - Smooth open/close transitions
 * - Quick prompt chips
 * - Connected to master dashboard-vault workspace
 */
const DashboardChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const MASTER_WORKSPACE = process.env.NEXT_PUBLIC_ANYTHING_LLM_MASTER_WORKSPACE || "dashboard-vault";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (msg?: string) => {
        const messageText = msg || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/dashboard/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText,
                    workspace: MASTER_WORKSPACE,
                }),
            });

            const data = await res.json();

            const aiMessage: Message = {
                role: "ai",
                content: data.response || "Sorry, I couldn't process that request.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Dashboard chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Connection error. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Premium Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "w-14 h-14 rounded-2xl",
                    "flex items-center justify-center",
                    "transition-all duration-300 ease-out",
                    isOpen
                        ? "bg-zinc-800 text-white rotate-0 scale-95"
                        : "bg-gradient-to-br from-[#0A52EF] to-[#0385DD] text-white anc-glow-button"
                )}
            >
                <div className="relative">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <Building2 className="w-6 h-6" />
                            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        </>
                    )}
                </div>
            </button>

            {/* Chat Panel with Glassmorphism */}
            <div className={cn(
                "fixed bottom-24 right-6 z-40 w-[400px]",
                "transition-all duration-300 ease-out transform",
                isOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                    : "opacity-0 translate-y-4 pointer-events-none scale-95"
            )}>
                <div className="anc-glass-card rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0A52EF] to-[#0385DD] p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">ANC Intelligence</h3>
                                    <p className="text-xs text-white/70">Ask about any project</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <Minimize2 className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="h-80 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white/50 to-white/30"
                    >
                        {messages.length === 0 && (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0A52EF]/20 to-purple-500/20 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-[#0A52EF]" />
                                </div>
                                <p className="text-sm font-semibold text-zinc-700">Business-Wide Context</p>
                                <p className="text-xs text-zinc-500 mt-2 max-w-[200px] mx-auto leading-relaxed">
                                    I have access to all your projects. Ask me anything about your business.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col max-w-[85%]",
                                    m.role === "user" ? "ml-auto items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm",
                                    m.role === "user"
                                        ? "bg-gradient-to-r from-[#0A52EF] to-[#0385DD] text-white rounded-br-md shadow-lg shadow-[#0A52EF]/20"
                                        : "bg-white text-zinc-700 rounded-bl-md shadow-md border border-zinc-100"
                                )}>
                                    {m.content}
                                </div>
                                <span className="text-[10px] text-zinc-400 mt-1 px-1">
                                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center gap-2">
                                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-md shadow-md border border-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#0A52EF]" />
                                        <span className="text-xs text-zinc-500">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Prompts & Input */}
                    <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-zinc-100/50">
                        {/* Quick prompts */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {QUICK_PROMPTS.map((qp, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(qp.prompt)}
                                    disabled={isLoading}
                                    className={cn(
                                        "text-[11px] font-medium",
                                        "px-3 py-1.5 rounded-full",
                                        "bg-zinc-100 hover:bg-[#0A52EF]/10 hover:text-[#0A52EF]",
                                        "transition-all duration-200",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Ask about your business..."
                                className={cn(
                                    "w-full px-4 py-3 pr-12 rounded-xl",
                                    "bg-zinc-100/80 border border-zinc-200/50",
                                    "text-sm placeholder:text-zinc-400",
                                    "focus:outline-none focus:ring-2 focus:ring-[#0A52EF]/50 focus:border-transparent",
                                    "transition-all duration-200"
                                )}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "absolute right-2 top-1/2 -translate-y-1/2",
                                    "w-8 h-8 rounded-lg",
                                    "flex items-center justify-center",
                                    "bg-[#0A52EF] text-white",
                                    "hover:bg-[#0A52EF]/90",
                                    "disabled:opacity-30 disabled:cursor-not-allowed",
                                    "transition-all duration-200"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardChat;

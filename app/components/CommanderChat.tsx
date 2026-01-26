"use client";

import React, { useState, useEffect, useRef } from "react";

// Contexts
import { useProposalContext } from "@/contexts/ProposalContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const CommanderChat = () => {
  const { _t } = useTranslationContext();
  const { applyCommand } = useProposalContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // welcome message
    setMessages([
      {
        id: "m0",
        role: "assistant",
        content: "Commander ready. Type commands like: 'Add two 100x50 10mm outdoor screens for Dallas Cowboys'.",
      },
    ]);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      const data = await res.json();

      // anythingLLM returned structured data in data.data
      if (data?.data) {
        const resp = data.data;

        // If model gave a textResponse
        if (resp.type === "textResponse" && resp.textResponse) {
          const text = resp.textResponse;
          setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: text }]);

          // text might itself be JSON action
          try {
            const parsed = JSON.parse(text);
            if (parsed && parsed.type) {
              applyCommand(parsed);
            }
          } catch (e) {
            // not JSON
          }
          return;
        }

        // If model returned a direct JSON object with an action
        if (resp.type === "action" && resp.action) {
          setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: JSON.stringify(resp.action) }]);
          applyCommand(resp.action);
          return;
        }

        // If resp itself is an action-like object
        if (resp.type && resp.type.startsWith && resp.type.startsWith("ADD_") || (resp.type === "action" && resp.payload)) {
          setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: JSON.stringify(resp) }]);
          if ((resp as any).type && (resp as any).type !== "textResponse") applyCommand(resp as any);
          return;
        }

        // Fallback: show raw JSON
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: JSON.stringify(resp) }]);

        // try to find embedded JSON in textResponse
        try {
          const parsed = JSON.parse(resp.textResponse || "");
          if (parsed && parsed.type) applyCommand(parsed);
        } catch (e) {}

        return;
      }

      // Plain text fallback
      if (data?.text) {
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: data.text }]);
        try {
          const parsed = JSON.parse(data.text);
          if (parsed && parsed.type) {
            applyCommand(parsed);
          }
        } catch (e) {}
        return;
      }

      // Fallback to raw object
      if (data && typeof data === "object") {
        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: JSON.stringify(data) }]);
        return;
      }

      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: "No response from controller" }]);
    } catch (err) {
      console.error("Commander send error:", err);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: "Network error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[350px] h-[calc(100vh-40px)] sticky top-10 left-4 bg-[#071019] text-white rounded-md shadow-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Commander</div>
        <div className="text-xs text-neutral-400">AI</div>
      </div>

      <div ref={messagesRef} className="flex-1 overflow-auto space-y-2 mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`p-2 rounded ${m.role === "user" ? "bg-[#0f1724] text-right" : "bg-[#0b2a3a] text-left"}`}>
            <div className="text-xs text-neutral-300 whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {loading && <div className="p-2 rounded bg-[#0b2a3a] text-left text-xs">Processing...</div>}
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Give an order..." className="bg-[#06131a] text-white" />
        <Button onClick={send} disabled={loading} className="bg-emerald-600">Send</Button>
      </div>
    </div>
  );
};

export default CommanderChat;

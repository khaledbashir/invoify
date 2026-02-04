"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/**
 * TemplateSelector - Phase 1: Single template (Standard/Hybrid)
 *
 * In Mirror Mode, NataliaMirrorTemplate is always used regardless of this setting.
 * This component is kept for UI consistency but only shows the active template.
 */
const TemplateSelector = () => {
    return (
        <div className="flex items-center gap-2 h-8 px-3 border border-border/50 rounded-md bg-muted/30">
            <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "#002C73" }}
            />
            <span className="text-xs font-medium text-foreground">ANC Standard</span>
            <Sparkles className="w-3 h-3 text-muted-foreground" />
        </div>
    );
};

export default TemplateSelector;

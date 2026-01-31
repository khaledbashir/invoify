"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Monitor,
    FileText,
    Briefcase,
    Layers,
    Trash2,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    clientName: string;
    proposalName: string | null;
    clientLogo?: string | null;
    status: string;
    documentType: string;
    pricingType: string;
    createdAt: string;
    updatedAt: string;
    lastSavedAt: string | null;
    screenCount?: number;
}

interface ProjectCardProps {
    project: Project;
    onImport: (id: string) => void;
    onDelete: (id: string) => void;
}

const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
        DRAFT: { label: "Draft", color: "#f59e0b" },
        PENDING_VERIFICATION: { label: "Pending", color: "#3b82f6" },
        APPROVED: { label: "Approved", color: "#10b981" },
        SIGNED: { label: "Signed", color: "#059669" },
    };
    return configs[status] || { label: status, color: "#71717a" };
};

const ProjectCard = ({ project, onImport, onDelete }: ProjectCardProps) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const status = getStatusConfig(project.status);

    const handleClick = () => {
        router.push(`/projects/${project.id}`);
    };

    return (
        <div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-[#09090b] border border-zinc-900 overflow-hidden transition-all duration-300 hover:border-zinc-700 p-6 flex flex-col h-full min-h-[220px]"
        >
            {/* Minimal Icon Area */}
            <div className="flex items-start justify-between mb-8">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                    {project.clientLogo ? (
                        <img src={project.clientLogo} alt={project.clientName} className="w-6 h-6 object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    ) : (
                        <Layers className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}80` }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Title Section */}
            <div className="space-y-1 py-4 flex-1">
                <h3 className="text-xl font-normal text-zinc-100 serif-vault group-hover:text-[#0A52EF] transition-colors leading-tight">
                    {project.clientName}
                </h3>
                <p className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    {project.proposalName || "Standard Project Resolution"}
                </p>
            </div>

            {/* Footer Metrics */}
            <div className="flex items-end justify-between mt-auto">
                <div className="space-y-1">
                    <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter">Budget Allocation</div>
                    <div className="text-sm font-medium text-zinc-300">$0.00</div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                        className="p-1 px-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </div>

            {/* Subtle Hover Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#0A52EF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default ProjectCard;

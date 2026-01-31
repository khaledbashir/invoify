"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, Building2, Sparkles, Bell, LayoutGrid, List } from "lucide-react";
import NewProjectModal from "@/app/components/modals/NewProjectModal";
import ProjectCard from "@/app/components/ProjectCard";
import DashboardChat from "@/app/components/DashboardChat";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    clientName: string;
    proposalName: string | null;
    status: string;
    documentType: string;
    pricingType: string;
    createdAt: string;
    updatedAt: string;
    lastSavedAt: string | null;
    screenCount?: number;
    aiWorkspaceSlug?: string | null;
}

type ViewMode = "grid" | "list";

const statusFilters = [
    { key: "all", label: "All Projects" },
    { key: "DRAFT", label: "Draft" },
    { key: "PENDING_VERIFICATION", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "SHARED", label: "Shared" },
    { key: "SIGNED", label: "Signed" },
];

/**
 * Project Vault - Premium Dashboard
 * 
 * Features:
 * - Mesh gradient background with floating color orbs
 * - Collapsible sidebar navigation
 * - Glassmorphism header
 * - Premium project cards in responsive grid
 * - Quick filter chips
 * - Floating AI chat assistant
 */
export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set("search", searchQuery);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/projects?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleImport = (projectId: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = (ev: any) => {
            const file = ev.target.files?.[0];
            if (file) {
                router.push(`/projects/${projectId}?autoImport=true`);
            }
        };
        input.click();
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            if (res.ok) {
                fetchProjects();
            }
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    return (
        <div className="min-h-screen anc-mesh-gradient">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area - with sidebar offset */}
            <div className="ml-64 transition-all duration-300">
                {/* Floating Background Orbs for extra premium feel */}
                <div className="anc-floating-orb w-[500px] h-[500px] bg-[#0A52EF]/5 top-20 right-[-10%]" />
                <div className="anc-floating-orb w-[400px] h-[400px] bg-purple-500/5 bottom-0 left-[20%]" />

                {/* Glassmorphism Header */}
                <header className="sticky top-0 z-30 anc-glass-header">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    "w-full pl-11 pr-4 py-3",
                                    "bg-white/50 backdrop-blur-sm",
                                    "border border-white/30 rounded-xl",
                                    "focus:outline-none focus:ring-2 focus:ring-[#0A52EF]/50 focus:border-transparent",
                                    "placeholder:text-zinc-400 text-zinc-700",
                                    "transition-all duration-200"
                                )}
                            />
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-4">
                            {/* Stats badge */}
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 anc-glass-card rounded-full">
                                <Building2 className="w-4 h-4 text-[#0A52EF]" />
                                <span className="text-sm font-medium text-zinc-600">
                                    {projects.length} Projects
                                </span>
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            </div>

                            {/* Notifications */}
                            <button className="w-10 h-10 rounded-xl anc-glass-card flex items-center justify-center hover:bg-white/80 transition-colors relative">
                                <Bell className="w-5 h-5 text-zinc-600" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            {/* User avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A52EF] to-[#03B8FF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#0A52EF]/20">
                                U
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-10">
                    {/* Page Title & Controls */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="font-serif text-5xl md:text-6xl font-black text-zinc-900 mb-3">
                                Project Vault
                            </h1>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <p className="text-sm font-medium">
                                    Synced just now — {projects.length} active projects
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* View Toggle */}
                            <div className="flex p-1 anc-glass-card rounded-xl">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                        viewMode === "grid"
                                            ? "bg-white shadow-sm text-zinc-800"
                                            : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                        viewMode === "list"
                                            ? "bg-white shadow-sm text-zinc-800"
                                            : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>

                            {/* New Project Button */}
                            <NewProjectModal>
                                <button className={cn(
                                    "flex items-center gap-2 px-6 py-3",
                                    "bg-[#0A52EF] text-white rounded-xl font-bold",
                                    "anc-glow-button",
                                    "hover:scale-105 active:scale-95",
                                    "transition-all duration-200"
                                )}>
                                    <Plus className="w-5 h-5" />
                                    New Project
                                </button>
                            </NewProjectModal>
                        </div>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={cn(
                                    "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold",
                                    "transition-all duration-200",
                                    statusFilter === filter.key
                                        ? "bg-[#0A52EF] text-white shadow-lg shadow-[#0A52EF]/25"
                                        : "anc-glass-chip hover:shadow-md"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Project Grid/List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#0A52EF]" />
                                </div>
                                <p className="text-sm font-medium text-zinc-500">Loading your projects...</p>
                            </div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="anc-glass-card rounded-3xl p-16 text-center">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#0A52EF]/20 to-[#03B8FF]/20 flex items-center justify-center mb-6">
                                <Building2 className="w-10 h-10 text-[#0A52EF]" />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-800 mb-3">No projects yet</h3>
                            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                                Create your first project to start building premium proposals with AI assistance.
                            </p>
                            <NewProjectModal>
                                <button className={cn(
                                    "inline-flex items-center gap-2 px-8 py-4",
                                    "bg-[#0A52EF] text-white rounded-xl font-bold text-lg",
                                    "anc-glow-button",
                                    "hover:scale-105 active:scale-95",
                                    "transition-all duration-200"
                                )}>
                                    <Plus className="w-5 h-5" />
                                    Create First Project
                                </button>
                            </NewProjectModal>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === "grid"
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "grid-cols-1"
                        )}>
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onImport={handleImport}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Floating AI Chat */}
            <DashboardChat />
        </div>
    );
}

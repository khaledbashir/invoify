"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    FileText,
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Users,
    BarChart3,
    FolderOpen,
    Bell,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoSelector from "@/app/components/reusables/LogoSelector";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const mainNavItems: NavItem[] = [
    { label: "Project Vault", href: "/projects", icon: LayoutGrid },
    { label: "Templates", href: "/templates", icon: FileText, badge: "Soon" },
    { label: "Analytics", href: "/analytics", icon: BarChart3, badge: "Soon" },
    { label: "Team", href: "/team", icon: Users, badge: "Soon" },
];

const secondaryNavItems: NavItem[] = [
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
];

/**
 * DashboardSidebar - Collapsible Premium Sidebar
 * 
 * Features:
 * - Glassmorphism styling
 * - Collapsible with smooth animation
 * - Active state highlighting
 * - Badge support for coming soon items
 * - ANC logo integration
 */
const DashboardSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen z-40",
                "anc-glass-card border-r-0",
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo & Toggle */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <div className={cn(
                    "flex items-center gap-3 overflow-hidden",
                    "transition-all duration-300",
                    isCollapsed ? "w-10" : "w-full"
                )}>
                    <div className="w-10 h-10 bg-[#0A52EF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0A52EF]/20">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <span className={cn(
                        "font-bold text-lg text-zinc-800 whitespace-nowrap",
                        "transition-opacity duration-200",
                        isCollapsed ? "opacity-0" : "opacity-100"
                    )}>
                        ANC Studio
                    </span>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        "bg-white/50 hover:bg-white text-zinc-500 hover:text-zinc-700",
                        "transition-all duration-200",
                        "absolute -right-4 top-4 shadow-md border border-zinc-200/50"
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="p-3 space-y-1">
                {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.badge ? "#" : item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                                "transition-all duration-200 group relative",
                                active
                                    ? "bg-[#0A52EF] text-white shadow-lg shadow-[#0A52EF]/25"
                                    : "text-zinc-600 hover:bg-white/80 hover:text-zinc-900",
                                item.badge && "opacity-60 cursor-not-allowed"
                            )}
                            onClick={(e) => item.badge && e.preventDefault()}
                        >
                            <Icon className={cn(
                                "w-5 h-5 flex-shrink-0",
                                active ? "text-white" : "text-zinc-500 group-hover:text-[#0A52EF]"
                            )} />
                            <span className={cn(
                                "font-medium whitespace-nowrap",
                                "transition-opacity duration-200",
                                isCollapsed ? "opacity-0 w-0" : "opacity-100"
                            )}>
                                {item.label}
                            </span>
                            {item.badge && !isCollapsed && (
                                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-zinc-200 text-zinc-500 rounded-full">
                                    {item.badge}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className={cn(
                                    "absolute left-full ml-2 px-3 py-1.5 rounded-lg",
                                    "bg-zinc-900 text-white text-sm font-medium",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "transition-all duration-200 whitespace-nowrap",
                                    "shadow-xl z-50"
                                )}>
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-2 text-xs text-zinc-400">({item.badge})</span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* AI Assistant Card */}
            <div className={cn(
                "mx-3 mt-6 p-4 rounded-2xl",
                "bg-gradient-to-br from-[#0A52EF]/10 via-purple-500/5 to-[#03B8FF]/10",
                "border border-[#0A52EF]/20",
                "transition-all duration-300",
                isCollapsed ? "opacity-0 invisible h-0 p-0 m-0" : "opacity-100 visible"
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#0A52EF]" />
                    <span className="font-semibold text-sm text-zinc-800">AI Assistant</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Ask questions about any project or get help with proposals.
                </p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Secondary Navigation */}
            <nav className="p-3 space-y-1 border-t border-white/10 mt-auto absolute bottom-0 left-0 right-0">
                {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                                "transition-all duration-200 group relative",
                                active
                                    ? "bg-zinc-100 text-zinc-900"
                                    : "text-zinc-500 hover:bg-white/80 hover:text-zinc-700"
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className={cn(
                                "font-medium whitespace-nowrap",
                                "transition-opacity duration-200",
                                isCollapsed ? "opacity-0 w-0" : "opacity-100"
                            )}>
                                {item.label}
                            </span>

                            {isCollapsed && (
                                <div className={cn(
                                    "absolute left-full ml-2 px-3 py-1.5 rounded-lg",
                                    "bg-zinc-900 text-white text-sm font-medium",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "transition-all duration-200 whitespace-nowrap",
                                    "shadow-xl z-50"
                                )}>
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default DashboardSidebar;

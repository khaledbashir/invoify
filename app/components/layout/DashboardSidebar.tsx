"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    FileText,
    BarChart3,
    Users,
    Settings,
    HelpCircle,
    Hexagon,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutGrid, label: "Vault", href: "/projects" },
    { icon: FileText, label: "Templates", href: "/templates", soon: true },
    { icon: BarChart3, label: "Analytics", href: "/analytics", soon: true },
    { icon: Users, label: "Team", href: "/team", soon: true },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-16 md:w-20 border-r border-zinc-900 bg-[#000000] flex flex-col items-center py-8 z-50">
            {/* Minimal Logo */}
            <div className="mb-12">
                <Link href="/projects" className="flex items-center justify-center">
                    <div className="w-10 h-10 flex items-center justify-center">
                        {/* <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-lg">
                            A
                        </div> */}
                        <img
                            src="/ANC_Logo_2023_white.png"
                            alt="ANC"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 flex flex-col gap-6">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "group relative p-3 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-[#0A52EF]/10 text-[#0A52EF]"
                                    : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50",
                                item.soon && "pointer-events-none opacity-40"
                            )}
                        >
                            <item.icon className="w-5 h-5" />

                            {/* Tooltip */}
                            <div className="absolute left-full ml-4 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label} {item.soon && "(Soon)"}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Nav */}
            <div className="flex flex-col gap-6 mt-auto">
                <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full border border-zinc-900 bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
                </div>
            </div>
        </aside>
    );
}

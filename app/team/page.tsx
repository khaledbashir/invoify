"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";

export default function TeamPage() {
  return (
    <div className="flex min-h-screen bg-background text-muted-foreground">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0 ml-16 md:ml-20 p-8">
        <div className="max-w-2xl mx-auto text-center space-y-6 py-24">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <p className="text-muted-foreground">Coming soon. Team and permissions will be available here.</p>
          <Link href="/projects" className="inline-flex items-center justify-center rounded-lg bg-[#0A52EF] text-white px-4 py-2 text-sm font-medium hover:opacity-90">
            Back to Vault
          </Link>
        </div>
      </main>
    </div>
  );
}

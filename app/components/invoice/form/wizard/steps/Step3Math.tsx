"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Calculator, DollarSign, Settings2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuditTable from "@/app/components/invoice/AuditTable";
import { formatCurrency } from "@/lib/helpers";

const Step3Math = () => {
    const { control, setValue } = useFormContext();
    const internalAudit = useWatch({
        name: "details.internalAudit",
        control,
    });

    // Watch or set a bond rate (default to 1.5 if not set)
    // We might need to initialize this in the form if it doesn't exist.
    const bondRate = useWatch({
        name: "details.bondRate",
        control
    }) || 1.5;

    const totals = internalAudit?.totals;
    const sellPricePerSqFt = totals?.sellingPricePerSqFt || 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Context */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-zinc-100 font-montserrat">Step 3: The Natalia Math</h2>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-400 text-sm">Finalize margins and review the P&L breakdown.</p>

                    {/* Global Metric: Gut Check */}
                    {totals && (
                        <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-lg shadow-sm">
                            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Selling Price / SqFt</div>
                            <div className="text-xl font-mono text-blue-400 font-bold">
                                {formatCurrency(sellPricePerSqFt)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-end mb-2">
                <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-md border border-zinc-800">
                    <Settings2 className="w-4 h-4 text-zinc-400" />
                    <Label className="text-xs text-zinc-400 font-medium">Bond Rate (%)</Label>
                    <Input
                        type="number"
                        step="0.1"
                        className="w-20 h-8 text-right bg-zinc-950 border-zinc-700 text-xs"
                        value={bondRate}
                        onChange={(e) => setValue("details.bondRate", parseFloat(e.target.value))}
                    />
                </div>
            </div>

            <Card className="bg-zinc-950/50 border border-zinc-800/40 backdrop-blur-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <DollarSign className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Internal Audit & P&L</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Detailed per-screen profitability analysis</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <AuditTable bondRateOverride={bondRate} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Step3Math;

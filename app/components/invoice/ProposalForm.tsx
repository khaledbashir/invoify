"use client";

import { useMemo } from "react";

// RHF
import { useFormContext, useWatch } from "react-hook-form";

// ShadCn
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Components
import {
    BillFromSection,
    BillToSection,
    ProposalDetails,
    Screens,
    Items,
    PaymentInformation,
    ProposalSummary,
} from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { Building2, User, LayoutGrid, Package, CreditCard, Calculator } from "lucide-react";

const ProposalForm = () => {
    const { _t } = useTranslationContext();

    const { control } = useFormContext();

    // Get proposal ID variable
    const proposalId = useWatch({
        name: "details.proposalId",
        control,
    });

    const proposalIdLabel = useMemo(() => {
        if (proposalId) {
            return `#${proposalId}`;
        } else {
            return _t("formNewPropBadge");
        }
    }, [proposalId]);

    return (
        <div className="w-full space-y-4">
            {/* Header Badge */}
            <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 px-3 py-1">
                    <p className="text-sm">{proposalIdLabel}</p>
                </Badge>
            </div>

            {/* Party Information */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <Building2 className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Parties</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Bill from & Bill to</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                        <BillFromSection />
                        <BillToSection />
                    </div>
                </CardContent>
            </Card>

            {/* Proposal Details */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <LayoutGrid className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Proposal Details</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Dates, notes, and project info</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProposalDetails />
                </CardContent>
            </Card>

            {/* Screens */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <Calculator className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Screens</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">LED screen configurations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Screens />
                </CardContent>
            </Card>

            {/* Items */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <Package className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Items</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Additional line items</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Items />
                </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <CreditCard className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Payment Information</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Terms and payment details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <PaymentInformation />
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#003366]/20">
                            <Calculator className="w-5 h-5 text-[#003366]" />
                        </div>
                        <div>
                            <CardTitle className="text-zinc-100 text-base">Summary</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Totals and breakdown</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProposalSummary />
                </CardContent>
            </Card>
        </div>
    );
};

export default ProposalForm;

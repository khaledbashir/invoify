"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Components
import {
    BaseButton,
    ProposalTemplate2,
} from "@/app/components";

// Template images
import template2 from "@/public/assets/img/proposal-2-example.png";

// Icons
import { Check } from "lucide-react";

// Types
import { ProposalType } from "@/types";

const TemplateSelector = () => {
    const { watch, setValue } = useFormContext<ProposalType>();
    const formValues = watch();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Single consolidated template
    const template = {
        id: 2,
        name: "ANC Proposal",
        description: "Official ANC proposal format with specs, pricing, and SOW",
        img: template2,
        component: <ProposalTemplate2 {...formValues} />,
    };

    // Auto-set template to 2 if not already set
    if (!formValues.details.pdfTemplate || formValues.details.pdfTemplate !== 2) {
        setValue("details.pdfTemplate", 2);
    }

    // Prevent flash by hiding preview until data is stable
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Proposal Template:</Label>
                <div className="grid grid-cols-1 max-w-md">
                    <Card
                        className="relative overflow-hidden border-[#0A52EF] ring-2 ring-[#0A52EF]/20"
                    >
                        {/* Fade-in overlay to prevent flash */}
                        {isInitialLoad && (
                            <div className="absolute inset-0 bg-white z-20 animate-pulse" />
                        )}
                        <div className="absolute top-4 right-4 z-10">
                            <div className="flex items-center gap-2 bg-[#0A52EF] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                <Check className="w-4 h-4" />
                                Active
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-xs">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-border">
                                <Image
                                    src={template.img}
                                    alt={template.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default TemplateSelector;

"use client";

import { useMemo } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { useFormContext, useWatch } from "react-hook-form";

// Components
import { WizardStep, WizardProgress } from "@/app/components";
import PersistentDrawer from "@/app/components/invoice/form/wizard/PersistentDrawer";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Step1Ingestion,
    Step2Intelligence,
    Step3Math,
    Step4Export
} from "@/app/components/invoice/form/wizard/steps";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

/*
 * Extracted Content to access Wizard Context for Progress Bar
 */
const WizardContent = () => {
    // We construct a mock "wizard" object to pass to WizardProgress
    // because React-Use-Wizard doesn't export the exact type easily or context hook returns methods directly.
    // However, existing WizardProgress expects a specific shape.
    // Let's check WizardProgress props. It expects `wizard: WizardValues`.
    // `useWizard` returns `WizardValues`. So we form it.

    const wizard = useWizard();
    const { activeStep } = wizard;
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [drawerMode, setDrawerMode] = React.useState<"pdf" | "chat">("chat");

    // Auto-Trigger Logic (The Ferrari Way)
    React.useEffect(() => {
        if (activeStep === 1) { // Step 2: Intelligence -> Open Chat
            setDrawerMode("chat");
            setIsDrawerOpen(true);
        } else if (activeStep === 2) { // Step 3: Math -> Open PDF Preview
            setDrawerMode("pdf");
            setIsDrawerOpen(true);
        } else if (activeStep === 3) {
            // Step 4: Export -> Main view has PDF, so maybe close drawer to avoid duplication?
            // Or keep it open if user wants? User said "Persistent... during Steps 2, 3, and 4".
            // We'll keep it open but maybe default to PDF.
            setDrawerMode("pdf");
        }
    }, [activeStep]);

    return (
        <div className="flex relative">
            {/* Main Content Area - shrink when drawer is open? Or overlay?
                 Drawer is "fixed right", so it overlays.
                 We might want to add right-padding to main content if drawer is open to prevent occlusion.
             */}
            <div className={cn("flex-1 transition-all duration-300", isDrawerOpen ? "mr-[600px]" : "")}>
                <div className="space-y-6">
                    <WizardProgress wizard={wizard} />

                    <div className="mt-6">
                        <WizardStep>
                            <Step1Ingestion />
                        </WizardStep>
                        <WizardStep>
                            <Step2Intelligence />
                        </WizardStep>
                        <WizardStep>
                            <Step3Math />
                        </WizardStep>
                        <WizardStep>
                            <Step4Export />
                        </WizardStep>
                    </div>
                </div>
            </div>

            {/* Persistent Drawer */}
            <PersistentDrawer
                isOpen={isDrawerOpen}
                onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
                activeMode={drawerMode}
                setActiveMode={setDrawerMode}
            />
        </div>
    );
};

// Helper hook for the label
const useProposalLabel = () => {
    const { _t } = useTranslationContext();
    const { control } = useFormContext();
    const proposalId = useWatch({
        name: "details.proposalId",
        control,
    });

    const proposalIdLabel = useMemo(() => {
        if (proposalId && proposalId !== 'new') {
            return `#${proposalId}`;
        } else {
            return _t("form.newPropBadge");
        }
    }, [proposalId, _t]);

    return { proposalIdLabel };
};

const ProposalForm = () => {
    return (
        <div className="w-full space-y-4">
            <Wizard>
                <WizardContent />
            </Wizard>
        </div>
    );
};

export default ProposalForm;

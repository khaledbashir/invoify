"use client";

import React from "react";
import { Wizard, useWizard } from "react-use-wizard";

// Components
import { WizardStep } from "@/app/components";
import {
    Step1Ingestion,
    Step2Intelligence,
    Step3Math,
    Step4Export
} from "@/app/components/invoice/form/wizard/steps";

/**
 * ProposalForm - Wizard-based form for the Hub (Drafting Mode)
 * Stepper is now in the top nav, so we just render steps here
 */
const ProposalForm = () => {
    return (
        <div className="p-6">
            <Wizard>
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
            </Wizard>
        </div>
    );
};

export default ProposalForm;

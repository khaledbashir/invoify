"use client";

// RHF
import { useFormContext } from "react-hook-form";

// React Wizard
import { WizardValues } from "react-use-wizard";

// Components
import { BaseButton } from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Types
import { ProposalType, WizardStepType } from "@/types";
import { useDebouncedSave } from "@/app/hooks/useDebouncedSave";

type WizardProgressProps = {
    wizard: WizardValues;
};

const WizardProgress = ({ wizard }: WizardProgressProps) => {
    const { activeStep, stepCount } = wizard;

    const {
        formState: { errors },
    } = useFormContext<ProposalType>();

    const { _t } = useTranslationContext();

    const step1Valid = !errors.sender && !errors.receiver;
    const step2Valid =
        !errors.details?.invoiceNumber &&
        !errors.details?.dueDate &&
        !errors.details?.invoiceDate &&
        !errors.details?.currency;

    const step3Valid = !errors.details?.items;
    const step4Valid = !errors.details?.paymentInformation;
    const step5Valid =
        !errors.details?.paymentTerms &&
        !errors.details?.subTotal &&
        !errors.details?.totalAmount &&
        !errors.details?.discountDetails?.amount &&
        !errors.details?.taxDetails?.amount &&
        !errors.details?.shippingDetails?.cost;

    /**
     * Determines the button variant based on the given WizardStepType.
     *
     * @param {WizardStepType} step - The wizard step object
     * @returns The button variant ("destructive", "default", or "outline") based on the step's validity and active status.
     */
    const returnButtonVariant = (step: WizardStepType) => {
        if (!step.isValid) {
            return "destructive";
        }
        if (step.id === activeStep) {
            return "default";
        } else {
            return "outline";
        }
    };

    /**
     * Checks whether the given WizardStepType has been passed or not.
     *
     * @param {WizardStepType} currentStep - The WizardStepType object
     * @returns `true` if the step has been passed, `false` if it hasn't, or `undefined` if the step is not valid.
     */
    const stepPassed = (currentStep: WizardStepType) => {
        if (currentStep.isValid) {
            return activeStep > currentStep.id ? true : false;
        }
    };

    const steps: WizardStepType[] = [
        {
            id: 0,
            label: "Ingestion & Parties",
            isValid: step1Valid,
        },
        {
            id: 1,
            label: "Intelligence & Specs",
            isValid: step2Valid,
        },
        {
            id: 2,
            label: "The Natalia Math",
            isValid: step3Valid,
        },
        {
            id: 3,
            label: "Ferrari Export",
            isValid: step4Valid,
        },
    ];

    const { saveToDb } = useDebouncedSave();

    // Wrapper for navigation
    const handleStepChange = async (stepId: number) => {
        // Trigger Save (Fire and forget, or await?)
        // User said "triggers a background PATCH", so fire and forget is fine, but maybe await to be safe?
        // Let's fire and forget to keep UI snappy, valid for "background".
        saveToDb();
        wizard.goToStep(stepId);
    };

    return (
        <div className="flex flex-wrap justify-around items-center gap-y-3">
            {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                    <BaseButton
                        variant={returnButtonVariant(step)}
                        className="w-auto"
                        onClick={() => handleStepChange(step.id)}
                    >
                        {step.id + 1}. {step.label}
                    </BaseButton>

                    {/* {step.id != stepCount - 1 && (
                        <div>
                            <Dot />
                        </div>
                    )} */}
                </div>
            ))}
        </div>
    );
};

export default WizardProgress;

"use client";

// RHF
import { useFormContext } from "react-hook-form";

// Components
import { DynamicProposalTemplate } from "@/app/components";

// Contexts
import { useProposalContext } from "@/contexts/ProposalContext";

// Types
import { ProposalType } from "@/types";

// Debounce
import { useDebounce } from "use-debounce";

/**
 * PdfViewer - Live PDF Preview
 * 
 * Always shows the live preview using DynamicProposalTemplate.
 * The preview updates in real-time as the user edits the form.
 * No redundant FinalPdf component - export actions are in Step4Export.
 */
const PdfViewer = () => {
    const { watch } = useFormContext<ProposalType>();
    const formValues = watch();
    // Use a shorter debounce so preview feels snappy
    const [debouncedValues] = useDebounce(formValues, 300);

    // Enterprise Template 2 uses a Blue header, so we force the White Logo.
    const forceWhiteLogo = debouncedValues.details?.pdfTemplate === 2;

    // Cast to any to accept the custom prop without TS errors
    const Template = DynamicProposalTemplate as any;

    return (
        <div className="w-full h-full flex flex-col items-center">
            {Template ? (
                <Template
                    {...debouncedValues}
                    forceWhiteLogo={forceWhiteLogo}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Generator Loading...
                </div>
            )}
        </div>
    );
};

export default PdfViewer;

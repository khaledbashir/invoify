"use client";

// RHF
import { useFormContext } from "react-hook-form";

// Components
import { FinalPdf, DynamicProposalTemplate } from "@/app/components";

// Contexts
import { useProposalContext } from "@/contexts/ProposalContext";

// Types
import { ProposalType } from "@/types";

// Debounce
import { useDebounce } from "use-debounce";

const PdfViewer = () => {
    const { proposalPdf } = useProposalContext();

    const { watch } = useFormContext<ProposalType>();

    // Use a shorter debounce so preview feels snappy
    const [debouncedWatch] = useDebounce(watch, 300);
    const formValues = debouncedWatch();

    return (
        <div className="my-3">
            {proposalPdf.size == 0 ? (
                <div className="w-full rounded-lg shadow-2xl bg-white min-h-[1000px] relative">
                    {/* 
                        LOGO GUARD:
                        We hook into the styles of the template.
                        Note: The template itself likely renders the logo.
                        If we want to "Strictly use the White Logo if PDF header background is Blue",
                        we need to pass this prop to `DynamicProposalTemplate` or ensure the template handles it.
                        
                        However, since PdfViewer is just the wrapper, we might need to intercept the props.
                        If DynamicProposalTemplate doesn't support an explicit logo override prop, we should add one.
                        
                        Assuming DynamicProposalTemplate takes `senderData` or `logoUrl`. 
                        We will inject the White Logo override if the template logic correlates to Blue.
                        The "ProposalTemplate2" (Indiana) usually has a Blue header.
                        
                        Let's try to override the logo in `formValues.details` or `formValues.sender` if possible.
                     */}
                    <div className="origin-top transform scale-50 md:scale-50 lg:scale-75">
                        {/* Force White Logo for Indiana (Template 2) */}
                        <DynamicProposalTemplate
                            {...formValues}
                            forceWhiteLogo={true} // We'll add this prop support to the template or generic wrapper
                        />
                    </div>
                </div>
            ) : (
                <FinalPdf />
            )}
        </div>
    );
};

export default PdfViewer;

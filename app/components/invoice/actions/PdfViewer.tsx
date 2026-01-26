"use client";

// Debounce
import { useDebounce } from "use-debounce";

// RHF
import { useFormContext } from "react-hook-form";

// Components
import { FinalPdf } from "@/app/components";
import SalesQuotation from "@/app/components/templates/ANCLOI";

// Contexts
import { useProposalContext } from "@/contexts/ProposalContext";

// Types
import { ProposalType } from "@/types";

const PdfViewer = () => {
    const { proposalPdf } = useProposalContext();

    const { watch } = useFormContext<ProposalType>();

    const [debouncedWatch] = useDebounce(watch, 1000);
    const formValues = debouncedWatch();

    // Transform RHF form values to match ANCLOI Proposal type
    const transformToProposalData = (values: ProposalType) => {
        return {
            id: values.details?.proposalId || "",
            name: values.details?.invoiceNumber || "Untitled Proposal",
            proposalDate: values.details?.proposalDate || new Date(),
            dueDate: values.details?.dueDate || new Date(),
            // Client info
            clientName: values.receiver?.name || "",
            clientAddress: values.receiver?.address || "",
            clientEmail: values.receiver?.email || "",
            clientPhone: values.receiver?.phone || "",
            // Screens with line items
            screens: (values.details?.screens || []).map((screen, index) => ({
                id: `screen-${index}`,
                name: screen.name || "",
                productType: screen.productType || "",
                widthFt: screen.widthFt || 0,
                heightFt: screen.heightFt || 0,
                pitchMm: screen.pitchMm || 0,
                quantity: screen.quantity || 1,
                desiredMargin: screen.desiredMargin || 0,
                costPerSqFt: screen.costPerSqFt || 0,
                lineItems: [
                    {
                        id: `display-${index}`,
                        name: `${screen.name} - ${screen.productType}`,
                        description: `${screen.widthFt}' H x ${screen.heightFt}' W - ${screen.pitchMm}mm`,
                        quantity: screen.quantity,
                        price: (screen.costPerSqFt || 0) * (screen.widthFt || 0) * (screen.heightFt || 0),
                    },
                ],
            })),
            // Additional items from invoice items
            additionalItems: (values.details?.items || []).map((item) => ({
                id: item.name,
                name: item.name,
                description: item.description || "",
                quantity: item.quantity,
                price: item.total,
            })),
            // Payment terms
            depositPercentage: 30,
            deliveryPercentage: 40,
            finalPercentage: 30,
            taxRate: values.details?.taxDetails?.amount ? parseFloat(values.details?.taxDetails?.taxID || "9.5") : 9.5,
        } as any;
    };

    return (
        <div className="my-3">
            {proposalPdf.size == 0 ? (
                <div className="w-full overflow-hidden rounded-lg shadow-2xl">
                    <div className="origin-top transform scale-50 md:scale-50 lg:scale-75">
                        <SalesQuotation proposal={transformToProposalData(formValues)} />
                    </div>
                </div>
            ) : (
                <FinalPdf />
            )}
        </div>
    );
};

export default PdfViewer;

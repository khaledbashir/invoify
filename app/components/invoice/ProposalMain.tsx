"use client";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import { Form } from "@/components/ui/form";

// Components
import { ProposalActions, ProposalForm } from "@/app/components";

// Context
import { useProposalContext } from "@/contexts/ProposalContext";

// Types
import { ProposalType } from "@/types";

const ProposalMain = () => {
    const { handleSubmit } = useFormContext<ProposalType>();

    // Get the needed values from proposal context
    const { onFormSubmit } = useProposalContext();

    return (
        <>
            <Form {...useFormContext<ProposalType>()}>
                <form
                    onSubmit={handleSubmit(onFormSubmit, (err) => {
                        console.log(err);
                    })}
                >
                    <div className="flex flex-col xl:flex-row gap-8">
                        <div className="flex-1 min-w-[400px]">
                            <ProposalForm />
                        </div>
                        <div className="w-full xl:w-[50%]">
                            <ProposalActions />
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
};

export default ProposalMain;

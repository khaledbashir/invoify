// Components
import { DynamicProposalTemplate, Subheading } from "@/app/components";

// Types
import { ProposalType } from "@/types";

type LivePreviewProps = {
    data: ProposalType;
};

export default function LivePreview({ data }: LivePreviewProps) {
    return (
        <>
            <Subheading>Live Preview:</Subheading>
            <div className="border dark:border-gray-600 rounded-xl my-1">
                <DynamicProposalTemplate {...data} />
            </div>
        </>
    );
}

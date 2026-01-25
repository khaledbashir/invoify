import React from "react";
import SalesQuotation from "@/app/components/templates/ANCLOI";
import { ProposalType } from "@/types";

const ProposalTemplate3 = (data: ProposalType) => {
    // SalesQuotation expects a `proposal` prop with screens and lineItems nested
    const proposalProp = data as any;

    return <SalesQuotation proposal={proposalProp} />;
};

export default ProposalTemplate3;

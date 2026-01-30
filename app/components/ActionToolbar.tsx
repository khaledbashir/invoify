"use client";

// ShadCn
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Components
import {
  BaseButton,
  NewProposalAlert,
  ProposalLoaderModal,
  ProposalExportModal,
} from "@/app/components";

// Contexts
import { useProposalContext } from "@/contexts/ProposalContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { FolderUp, Import, Plus, RotateCcw, FileText } from "lucide-react";

const ActionToolbar = () => {
  const { proposalPdfLoading, newProposal, resetProposal } = useProposalContext();
  const { _t } = useTranslationContext();

  return (
    <div className="flex items-center justify-end gap-1 mb-2 px-2">
      <ProposalLoaderModal>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 h-8 px-2"
          disabled={proposalPdfLoading}
          title={_t("actions.loadProposal")}
        >
          <FolderUp className="w-3.5 h-3.5 mr-2" />
          <span className="text-[10px] font-medium uppercase tracking-wide">{_t("actions.loadProposal")}</span>
        </Button>
      </ProposalLoaderModal>

      <div className="w-px h-3 bg-zinc-800 mx-1" />

      <ProposalExportModal>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 h-8 px-2"
          disabled={proposalPdfLoading}
          title={_t("actions.exportProposal")}
        >
          <Import className="w-3.5 h-3.5 mr-2" />
          <span className="text-[10px] font-medium uppercase tracking-wide">{_t("actions.exportProposal")}</span>
        </Button>
      </ProposalExportModal>

      <div className="w-px h-3 bg-zinc-800 mx-1" />

      <NewProposalAlert>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 h-8 px-2"
          disabled={proposalPdfLoading}
          title={_t("actions.newProposal")}
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          <span className="text-[10px] font-medium uppercase tracking-wide">{_t("actions.newProposal")}</span>
        </Button>
      </NewProposalAlert>

      <NewProposalAlert
        title="Reset form?"
        description="This will clear all fields and re-fetch the baseline data from the Vault."
        confirmLabel="Reset"
        onConfirm={resetProposal}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 h-8 px-2"
          disabled={proposalPdfLoading}
          title="Reset Form"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          <span className="text-[10px] font-medium uppercase tracking-wide">Reset</span>
        </Button>
      </NewProposalAlert>
    </div>
  );
};

export default ActionToolbar;

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ModeSwitchWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fromMode: "INTELLIGENCE" | "MIRROR";
  toMode: "INTELLIGENCE" | "MIRROR";
}

const ModeSwitchWarning = ({
  open,
  onOpenChange,
  onConfirm,
  fromMode,
  toMode,
}: ModeSwitchWarningProps) => {
  const isIntelligenceToMirror = fromMode === "INTELLIGENCE" && toMode === "MIRROR";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border text-foreground">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <AlertDialogTitle>Confirm Calculation Mode Switch</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground space-y-2">
            {isIntelligenceToMirror ? (
              <>
                <p>
                  You are switching from <strong className="text-foreground">Intelligence Mode</strong> to{" "}
                  <strong className="text-foreground">Mirror Mode</strong>.
                </p>
                <p className="text-amber-400/90">
                  ⚠️ Warning: All AI-generated optimizations and margin calculations will be disabled.
                  Your pricing will be locked to the imported Excel values.
                </p>
                <p className="text-sm mt-2">
                  Manual modifications made in Intelligence Mode will remain visible but may no longer be
                  automatically optimized.
                </p>
              </>
            ) : (
              <>
                <p>
                  You are switching from <strong className="text-foreground">Mirror Mode</strong> to{" "}
                  <strong className="text-foreground">Intelligence Mode</strong>.
                </p>
                <p className="text-emerald-400/90">
                  ✓ The Natalia Math Engine will now activate to calculate margins and optimize
                  profitability.
                </p>
                <p className="text-sm mt-2">
                  Your imported Excel values will serve as a baseline for further optimization.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-muted text-foreground hover:bg-accent border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#0A52EF] text-white hover:bg-[#0A52EF]/90"
          >
            Confirm Switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModeSwitchWarning;

"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  FileText,
  Info,
  Plus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { WhatIsRoscaModal } from "@/components/shared/what-is-rosca-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { CreateRondaProvider, useCreateRonda } from "./create-ronda-context";
import { Step1BasicInfo } from "./step-1-basic-info";
import { Step2Contribution } from "./step-2-contribution";
import { Step3Participants } from "./step-3-participants";
import { Step4Review } from "./step-4-review";

type CreateRondaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TOTAL_STEPS = 4;

const STEP_CONFIG = {
  1: { title: "Basic Information", icon: FileText, percent: 25, emoji: "👋" },
  2: { title: "Contribution Setup", icon: Coins, percent: 50, emoji: "✋" },
  3: { title: "Participants", icon: Users, percent: 75, emoji: "👥" },
  4: { title: "Review & Confirm", icon: Check, percent: 100, emoji: "👀" },
};

function CreateRondaModalContent({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { formData, resetFormData, canProceedFromStep } = useCreateRonda();
  const [currentStep, setCurrentStep] = useState(1);
  const [showWhatIsRosca, setShowWhatIsRosca] = useState(false);

  const stepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG];
  const progress = stepConfig?.percent || 0;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    resetFormData();
  };

  const handleCreateRosca = () => {
    // TODO: Implement actual creation logic - API call here
    console.log("Creating ROSCA with:", formData);
    // Call your API endpoint here with formData
    // Example:
    // await fetch('/api/rondas', {
    //   method: 'POST',
    //   body: JSON.stringify(formData),
    // });
    handleClose();
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2Contribution />;
      case 3:
        return <Step3Participants />;
      case 4:
        return <Step4Review onEditStep={handleEditStep} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog onOpenChange={handleClose} open={open}>
        <DialogContent className="h-[1000px] max-h-screen w-full max-w-[420px] overflow-y-auto rounded-none bg-zinc-100 p-0 [&>button]:hidden">
          {/* Header with backdrop blur */}
          <div className="sticky top-0 z-10 flex h-[69px] items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-4">
            {currentStep > 1 ? (
              <button
                className="flex size-11 items-center justify-center rounded-xl hover:bg-zinc-50"
                onClick={handleBack}
                type="button"
              >
                <ArrowLeft className="size-6" />
              </button>
            ) : (
              <div className="size-11" />
            )}
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-warning/20">
                <span className="text-xl">
                  {currentStep === 1 ? "💰" : "🍍"}
                </span>
              </div>
              <span className="font-bold text-lg text-zinc-950 tracking-[-0.45px]">
                RONDA
              </span>
            </div>
            <DialogClose asChild>
              <motion.button
                className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-zinc-50"
                type="button"
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="size-6 rotate-45" />
              </motion.button>
            </DialogClose>
          </div>

          <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
            {/* Header */}
            <DialogHeader className="gap-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-left font-semibold text-2xl text-zinc-950 tracking-[-0.6px]">
                  {currentStep === 4
                    ? "Summary & Confirmation"
                    : "Create New Group"}
                </DialogTitle>
                {currentStep !== 4 && (
                  <button
                    className="flex cursor-pointer items-center gap-1.5 font-medium text-primary text-xs hover:text-primary/80"
                    onClick={() => setShowWhatIsRosca(true)}
                    type="button"
                  >
                    <Info className="size-4" />
                    <span>What is a ROSCA?</span>
                  </button>
                )}
              </div>
            </DialogHeader>

            {/* Progress Card */}
            <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-2xl">{stepConfig?.emoji || "📝"}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="font-bold text-base text-zinc-950 tracking-[-0.4px]">
                        Step {currentStep} of {TOTAL_STEPS}
                      </p>
                      <p className="text-[#6f7780] text-sm">
                        {stepConfig?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="font-medium text-muted text-xs">
                      {progress}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {renderStepContent()}
          </div>

          {/* Bottom Bar with Navigation Buttons and Progress Dots */}
          <div className="sticky bottom-0 flex flex-col gap-4 border-border border-t bg-white p-4">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button
                className="h-12 flex-1 rounded-2xl border-0 bg-[rgba(244,244,245,0.5)] font-semibold text-sm text-zinc-950 tracking-[-0.35px] hover:bg-[rgba(244,244,245,0.7)]"
                disabled={currentStep === 1}
                onClick={handleBack}
                variant="outline"
              >
                <ArrowLeft className="size-5" />
                Back
              </Button>
              {currentStep === TOTAL_STEPS ? (
                <Button
                  className="h-[52px] flex-1 rounded-2xl bg-primary font-semibold text-base text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90"
                  onClick={handleCreateRosca}
                >
                  Create ROSCA
                  <Check className="size-5" />
                </Button>
              ) : (
                <Button
                  className="h-[52px] flex-1 rounded-2xl bg-primary font-semibold text-base text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  disabled={!canProceedFromStep(currentStep)}
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="size-5" />
                </Button>
              )}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    index + 1 === currentStep ? "bg-[#7b8ff5]" : "bg-[#e8ebed]"
                  )}
                  key={`step-${index + 1}`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* What is ROSCA Modal - Moved outside to prevent nesting issues */}
      <WhatIsRoscaModal
        onOpenChange={setShowWhatIsRosca}
        open={showWhatIsRosca}
      />
    </>
  );
}

export function CreateRondaModal({
  open,
  onOpenChange,
}: CreateRondaModalProps) {
  return (
    <CreateRondaProvider>
      <CreateRondaModalContent onOpenChange={onOpenChange} open={open} />
    </CreateRondaProvider>
  );
}

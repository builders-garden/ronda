"use client";

import sdk from "@farcaster/miniapp-sdk";
import { getUniversalLink } from "@selfxyz/core";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  FileText,
  Info,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Address, decodeEventLog } from "viem";
import { useAccount } from "wagmi";
import { WhatIsRoscaModal } from "@/components/shared/what-is-rosca-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useBatchCreateParticipants } from "@/hooks/use-batch-create-participants";
import { useCreateGroup } from "@/hooks/use-create-group";
import { Frequency, Genders } from "@/lib/enum";
import { env } from "@/lib/env";
import RondaProtocolFactoryAbi from "@/lib/smart-contracts/abis/RondaProtocolFactory.json";
import {
  type DeployRondaProtocolParams,
  useDeployRondaProtocol,
  type VerificationConfig,
} from "@/lib/smart-contracts/use-deploy-ronda-protocol";
import {
  cn,
  frequencyToSeconds,
  getVerificationType,
  normalizeToSlug,
} from "@/utils";
import { CreateRondaProvider, useCreateRonda } from "./create-ronda-context";
import { Step1BasicInfo } from "./step-1-basic-info";
import { Step2Contribution } from "./step-2-contribution";
import { Step3Participants } from "./step-3-participants";
import { Step4Review } from "./step-4-review";
import { Step5Success } from "./step-5-success";

type CreateRondaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TOTAL_STEPS = 5;

const STEP_CONFIG = {
  1: { title: "Basic Information", icon: FileText, percent: 25, emoji: "👋" },
  2: { title: "Contribution Setup", icon: Coins, percent: 50, emoji: "✋" },
  3: { title: "Participants", icon: Users, percent: 75, emoji: "👥" },
  4: { title: "Review & Confirm", icon: Check, percent: 100, emoji: "👀" },
  5: { title: "Success", icon: Check, percent: 100, emoji: "✅" },
};

function CreateRondaModalContent({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { address } = useAccount();
  const { formData, resetFormData, canProceedFromStep } = useCreateRonda();
  const [currentStep, setCurrentStep] = useState(1);
  const [showWhatIsRosca, setShowWhatIsRosca] = useState(false);
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [isCreatingGroupRecord, setIsCreatingGroupRecord] = useState(false);
  const [_createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [deployedContractAddress, setDeployedContractAddress] =
    useState<Address | null>(null);

  const stepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG];
  const progress = stepConfig?.percent || 0;

  // Group deployment hook
  const {
    deploy,
    hash: _deployHash,
    receipt: deployReceipt,
    isPending: isDeployPending,
    isConfirming: isDeployConfirming,
    isConfirmed: isDeployConfirmed,
    error: deployError,
  } = useDeployRondaProtocol();

  // Combined loading state
  const isCreatingRoscaGroup = isDeployingContract || isCreatingGroupRecord;

  // Group record creation hook
  const { mutate: createGroup } = useCreateGroup();

  // Batch participant creation hook
  const { mutate: batchCreateParticipants } = useBatchCreateParticipants();

  // Next step handler
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Back step handler
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Close modal handler
  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    resetFormData();
    setCreatedGroupId(null);
    setDeployedContractAddress(null);
  };

  // Verify identity handler
  const handleVerifyIdentity = async () => {
    if (!(address && deployedContractAddress)) {
      toast.error("Missing required information for verification");
      return;
    }

    try {
      // Build disclosures based on form data
      const disclosures: {
        nationality?: boolean;
        gender?: boolean;
        date_of_birth?: boolean;
        minimumAge?: number;
        ofac?: boolean;
      } = {};

      // const verificationType = getVerificationType(formData);

      // Nationality is required if allowedNationalities is specified
      if (
        formData.nationalityVerification &&
        formData.allowedNationalities &&
        formData.allowedNationalities.length > 0
      ) {
        disclosures.nationality = true;
      }

      // Gender is required if gender verification is enabled and not ALL
      if (
        formData.genderVerification &&
        formData.allowedGenders !== Genders.ALL
      ) {
        disclosures.gender = true;
      }

      // Date of birth is required if age verification is enabled
      if (
        formData.ageVerification &&
        formData.minAge &&
        formData.minAge.trim().length > 0
      ) {
        disclosures.date_of_birth = true;
        disclosures.minimumAge = Number.parseInt(formData.minAge, 10);
      }

      disclosures.ofac = false;

      // Generate the scope seed (same as used in deployment)
      const scopeSeed = "ronda-test";

      // Build the Self app
      const app = new SelfAppBuilder({
        appName: "Ronda Protocol",
        scope: scopeSeed,
        userId: address,
        userIdType: "hex",
        endpoint: deployedContractAddress.toLowerCase(),
        deeplinkCallback: `https://farcaster.xyz/miniapps/lnjFQwjNJNYE/revu-tunnel/circles/${deployedContractAddress}?verified=true`,
        endpointType: "celo",
        userDefinedData: "Verify your identity to join the group",
        disclosures,
      }).build();

      // Get the universal link
      const deeplink = getUniversalLink(app);

      // Open the Self app
      await sdk.actions.openUrl(deeplink);
    } catch (error) {
      console.error("Error opening Self verification:", error);
      toast.error("Failed to open verification");
    }
  };

  // The function to create the ROSCA group
  const handleCreateRosca = () => {
    // Check if we are in step 4, the last one
    if (currentStep === 4) {
      // Call the smart contract function to create the group
      if (!address) {
        return;
      }

      // Set the deploying contract state to true
      setIsDeployingContract(true);

      // Generate the verification config based on the form data
      const verificationConfig: VerificationConfig = {
        ...(formData.ageVerification &&
        formData.minAge &&
        formData.minAge.trim().length > 0
          ? { olderThan: BigInt(Number.parseInt(formData.minAge, 10)) }
          : { olderThan: BigInt(0) }),
        forbiddenCountries: [],
        ofacEnabled: false,
      };

      // Generate the scope seed based on the form data
      const scopeSeed = "ronda-test";

      // Get the verification type based on the form data
      const verificationType = getVerificationType(formData);

      // Get the seconds based on the frequency
      const depositFrequency = frequencyToSeconds(
        formData.frequency || Frequency.WEEKLY
      );
      const borrowFrequency = frequencyToSeconds(
        formData.frequency || Frequency.WEEKLY
      );

      const params: DeployRondaProtocolParams = {
        name: formData.roscaName,
        factoryAddress: env.NEXT_PUBLIC_RONDA_FACTORY_ADDRESS as Address,
        scopeSeed,
        verificationConfig,
        creator: address,
        depositFrequency: BigInt(depositFrequency),
        borrowFrequency: BigInt(borrowFrequency),
        recurringAmount: BigInt(
          Number.parseFloat(formData.contributionAmount) * 10 ** 6
        ),
        operationCounter: BigInt(formData.numberOfCycles || 4),
        verificationType,
        minAge: BigInt(Number.parseInt(formData.minAge || "18", 10)),
        allowedNationalities: formData.nationalityVerification
          ? formData.allowedNationalities
          : [],
        requiredGender:
          formData.allowedGenders === Genders.ALL
            ? ""
            : formData.allowedGenders,
        usersToInvite:
          formData.participants.map((participant) => participant.address) || [],
      };
      console.log("TEST Deploying with parameters:", params);

      deploy(params);
    }
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
      case 5:
        return <Step5Success onVerifyIdentity={handleVerifyIdentity} />;
      default:
        return null;
    }
  };

  // Wait for deployment to complete and extract contract address
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // Only proceed if deployment is confirmed and we have a receipt
    if (isDeployConfirmed && deployReceipt?.logs) {
      console.log(
        "Deployment confirmed, decoding contract address from receipt"
      );
      setIsDeployingContract(false);
      setIsCreatingGroupRecord(true);

      try {
        // Decode the RondaProtocolDeployed event from the logs
        for (const log of deployReceipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: RondaProtocolFactoryAbi,
              data: log.data,
              topics: log.topics,
            });
            console.log("Waiting for RondaProtocolDeployed event");
            if (decoded.eventName === "RondaProtocolDeployed" && decoded.args) {
              const args = decoded.args as unknown as {
                groupId: bigint;
                rondaProtocol: Address;
                deployer: Address;
                salt: `0x${string}`;
              };
              const deployedAddress = args.rondaProtocol;
              console.log(
                "Deployed contract address from decoded transaction:",
                deployedAddress
              );
              // Store the deployed contract address for verification
              setDeployedContractAddress(deployedAddress);

              // Now create the group record in the database
              createGroup(
                {
                  name: normalizeToSlug(formData.roscaName),
                  description: formData.description,
                  creatorId: user?.id || "",
                  groupAddress: deployedAddress,
                },
                {
                  onSuccess: (response) => {
                    const groupId = response.group.id;

                    // Create all participants in batch
                    batchCreateParticipants(
                      {
                        groupId,
                        adminAddress: address || "",
                        participants: formData.participants.map(
                          (participant) => ({
                            userAddress: participant.address,
                            farcasterFid: participant.fid ?? undefined,
                          })
                        ),
                      },
                      {
                        onSuccess: (result) => {
                          if (result.skipped > 0) {
                            toast.success(
                              `ROSCA group created! ${result.created} participants added, ${result.skipped} already existed.`
                            );
                          } else {
                            toast.success("ROSCA group created successfully");
                          }
                          setIsCreatingGroupRecord(false);
                          setCreatedGroupId(groupId);
                          // Navigate to success step
                          setCurrentStep(5);
                        },
                        onError: (error) => {
                          console.error("Error creating participants:", error);
                          toast.error("Failed to create participants");
                          setIsCreatingGroupRecord(false);
                        },
                      }
                    );
                  },
                  onError: () => {
                    toast.error("Failed to create ROSCA group");
                    setIsCreatingGroupRecord(false);
                  },
                }
              );
              break; // Exit loop once we found the event
            }
          } catch (_error) {
            // Ignore errors for events that don't match
          }
        }
      } catch (error) {
        console.error("Error decoding deployment event:", error);
        toast.error("Failed to decode contract address");
        setIsCreatingGroupRecord(false);
      }
    }
  }, [isDeployConfirmed, deployReceipt]);

  // In case of deployment error, show the error message
  useEffect(() => {
    if (deployError) {
      toast.error("Failed to deploy ROSCA contract");
      console.error("Deployment error:", deployError);
      setIsDeployingContract(false);
      setIsCreatingGroupRecord(false);
    }
  }, [deployError]);

  return (
    <>
      <Dialog onOpenChange={handleClose} open={open}>
        <DialogContent className="h-[1000px] max-h-screen w-full max-w-[420px] overflow-y-auto rounded-none bg-zinc-100 p-0 [&>button]:hidden">
          {/* Header with backdrop blur */}
          <div className="sticky top-0 z-10 flex h-[69px] items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-4">
            {currentStep > 1 && currentStep < 5 ? (
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
            {currentStep !== 5 ? (
              <DialogClose asChild>
                <motion.button
                  className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-muted hover:bg-zinc-50"
                  type="button"
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="size-6 rotate-45" />
                </motion.button>
              </DialogClose>
            ) : (
              <div className="size-11" />
            )}
          </div>

          <div
            className={cn(
              "flex flex-col gap-6 px-4 pb-4",
              currentStep === 5 ? "pt-0" : "pt-4"
            )}
          >
            {/* Header */}
            {currentStep !== 5 && (
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
                      <span className="shrink-0">What is a ROSCA?</span>
                    </button>
                  )}
                </div>
              </DialogHeader>
            )}

            {/* Progress Card - Hide on success step */}
            {currentStep !== 5 && (
              <div className="rounded-2xl border border-[rgba(232,235,237,0.3)] bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="text-2xl">
                      {stepConfig?.emoji || "📝"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="font-bold text-base text-zinc-950 tracking-[-0.4px]">
                          Step {currentStep} of {TOTAL_STEPS - 1}
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
            )}

            {/* Step Content */}
            {renderStepContent()}
          </div>

          {/* Bottom Bar with Navigation Buttons and Progress Dots - Hide on success step */}
          {currentStep !== 5 && (
            <div className="flex flex-col gap-4 border-border border-t bg-white p-4">
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
                {currentStep === 4 ? (
                  <Button
                    className="h-[52px] flex-1 cursor-pointer rounded-2xl bg-primary font-semibold text-base text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    disabled={isCreatingRoscaGroup}
                    onClick={handleCreateRosca}
                  >
                    <AnimatePresence mode="wait">
                      {isDeployingContract ? (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key="deploying-contract"
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <Loader2 className="size-5 animate-spin" />
                          {isDeployPending && "Submitting..."}
                          {isDeployConfirming && "Deploying contract..."}
                        </motion.div>
                      ) : isCreatingGroupRecord ? (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key="creating-group-record"
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <Loader2 className="size-5 animate-spin" />
                          Creating group...
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key="create-rosca-group"
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          Create ROSCA
                          <Check className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                ) : (
                  <Button
                    className="h-[52px] flex-1 cursor-pointer rounded-2xl bg-primary font-semibold text-base text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90 disabled:opacity-50"
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
                {Array.from({ length: TOTAL_STEPS - 1 }).map((_, index) => (
                  <div
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      index + 1 === currentStep
                        ? "bg-[#7b8ff5]"
                        : "bg-[#e8ebed]"
                    )}
                    key={`step-${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
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

import sdk from "@farcaster/miniapp-sdk";
import { getUniversalLink } from "@selfxyz/core";
import { SelfAppBuilder } from "@selfxyz/qrcode";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Loader2,
  type MessageCircle,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupParticipantsWithStatus } from "@/hooks/use-group-participants-with-status";
import { useMockPayout } from "@/hooks/use-mock-payout";
import { useUpdateParticipant } from "@/hooks/use-update-participant";
import { RondaStatus } from "@/lib/enum";
import {
  useGetGroupInfoDetailed,
  useGetNextPayoutDeadline,
  useHasUserDepositedCurrentPeriod,
  useIsMember,
  useIsUserVerified,
  useJoinGroup,
} from "@/lib/smart-contracts/hooks";
import { cn, normalizeToSlug } from "@/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { ParticipantProfileCard } from "./participant-profile-card";
import { ProfileCard } from "./profile-card";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

type Member = {
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined" | "due" | "skipped" | "paid";
  statusMessage?: string;
};

type Activity = {
  title: string;
  message: string;
  timestamp: string;
  icon: typeof MessageCircle;
  iconBg?: string;
};

type RondaDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  triggerClassName?: string;
  children: React.ReactNode;
  asChild?: boolean;
  // Contract address for verification and joining
  contractAddress?: Address;
  // Ronda data
  name?: string;
  memberCount?: number;
  weeklyAmount?: string;
  status?: RondaStatus;
  potAmount?: string;
  nextPayout?: string;
  currentWeek?: number;
  totalWeeks?: number;
  createdDate?: string;
  progress?: number;
  // Deposit due specific
  depositAmount?: string;
  depositDeadline?: Date | string;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
  };
  isDepositing?: boolean;
  depositStatus?: "idle" | "approving" | "depositing";
  // Members and activity
  members?: Member[];
  activities?: Activity[];
  // Backend group ID for fetching participants
  groupId?: string;
  // Actions
  onDeposit?: () => void | Promise<void>;
  onViewAllMembers?: () => void;
};

function formatCountdown(
  days: number,
  hours: number,
  minutes: number
): {
  days: string;
  hours: string;
  minutes: string;
} {
  return {
    days: `${days}d`,
    hours: `${hours}h`,
    minutes: `${minutes}m`,
  };
}

function useCountdown(deadline?: Date | string) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!deadline) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const target =
        typeof deadline === "string" ? new Date(deadline) : deadline;
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return timeRemaining;
}

export const RondaDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  triggerClassName,
  children,
  asChild,
  contractAddress,
  name: nameProp,
  memberCount: memberCountProp,
  weeklyAmount: weeklyAmountProp,
  status: statusProp,
  potAmount: potAmountProp,
  nextPayout: nextPayoutProp,
  currentWeek: currentWeekProp,
  totalWeeks: totalWeeksProp,
  createdDate: createdDateProp,
  progress: progressProp,
  depositAmount: depositAmountProp,
  depositDeadline,
  timeRemaining: timeRemainingProp,
  isDepositing,
  depositStatus = "idle",
  members,
  activities,
  groupId,
  onDeposit,
  onViewAllMembers,
}: RondaDrawerProps) => {
  const { address } = useAccount();
  const [prevDepositStatus, setPrevDepositStatus] = useState<
    "idle" | "approving" | "depositing"
  >("idle");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // Fetch participants with their status from backend and blockchain
  const {
    participants: participantsWithStatus,
    isLoading: isLoadingParticipants,
    refetch: refetchParticipants,
  } = useGroupParticipantsWithStatus({
    groupId: groupId ?? "",
    contractAddress,
    enabled: !!groupId,
  });

  const { mutate: updateParticipant } = useUpdateParticipant();

  // Fetch on-chain data
  const { data: groupInfo, refetch: refetchGroupInfo } =
    useGetGroupInfoDetailed(contractAddress, !!contractAddress);
  const { data: hasDeposited, refetch: refetchHasDeposited } =
    useHasUserDepositedCurrentPeriod(
      contractAddress,
      address,
      !!contractAddress && !!address
    );

  // Get next payout deadline from smart contract
  const { data: nextPayoutDeadline, refetch: refetchNextPayoutDeadline } =
    useGetNextPayoutDeadline(contractAddress, !!contractAddress);

  // Compute values from on-chain data
  const recurringAmount = useMemo(() => {
    if (!groupInfo) {
      console.log("No group info");
      return 0;
    }
    return Number(
      formatUnits(groupInfo.recurringAmount ?? BigInt(0), USDC_DECIMALS)
    );
  }, [groupInfo]);

  const weeklyAmount = weeklyAmountProp ?? `$${recurringAmount.toFixed(0)}`;
  const depositAmount = depositAmountProp ?? `$${recurringAmount.toFixed(0)}`;

  const totalWeeks =
    totalWeeksProp ?? (groupInfo ? Number(groupInfo.operationCounter) : 8);
  const currentWeek =
    currentWeekProp ??
    (groupInfo
      ? Math.min(Number(groupInfo.currentOperationIndex) + 1, totalWeeks)
      : 3);

  // Calculate pot amount from on-chain data using currentPeriodDeposits from groupInfo
  const potAmount = useMemo(() => {
    if (potAmountProp) {
      return potAmountProp;
    }

    if (groupInfo?.currentPeriodDeposits !== undefined) {
      const deposits = Number(
        formatUnits(groupInfo.currentPeriodDeposits, USDC_DECIMALS)
      );
      return `$${deposits.toFixed(2)}`;
    }

    // Fallback: estimate based on recurring amount and current week
    const estimatedPot = recurringAmount * currentWeek;
    return `$${estimatedPot.toFixed(2)}`;
  }, [
    potAmountProp,
    groupInfo?.currentPeriodDeposits,
    recurringAmount,
    currentWeek,
  ]);

  // Calculate next payout date based on smart contract deadline
  const nextPayout = useMemo(() => {
    if (nextPayoutProp) {
      return nextPayoutProp;
    }

    if (nextPayoutDeadline) {
      // Convert bigint timestamp (in seconds) to Date
      const nextPayoutDate = new Date(Number(nextPayoutDeadline) * 1000);
      return nextPayoutDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (!groupInfo) {
      return "TBD";
    }

    // Fallback calculation
    const depositFrequencyDays =
      Number(groupInfo.depositFrequency) / (24 * 60 * 60);
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(
      nextPayoutDate.getDate() + Math.ceil(depositFrequencyDays)
    );

    return nextPayoutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [nextPayoutProp, nextPayoutDeadline, groupInfo]);

  // Determine status from on-chain data
  const status = useMemo(() => {
    if (statusProp) {
      return statusProp;
    }

    if (!groupInfo) {
      console.log("No group info");
      return RondaStatus.ACTIVE;
    }

    if (currentWeek >= totalWeeks) {
      return RondaStatus.COMPLETED;
    }

    if (!hasDeposited && address) {
      return RondaStatus.DEPOSIT_DUE;
    }

    return RondaStatus.ACTIVE;
  }, [statusProp, groupInfo, currentWeek, totalWeeks, hasDeposited, address]);

  const name = nameProp ?? "Ronda Name";
  const memberCount = memberCountProp ?? (participantsWithStatus.length || 12);
  const createdDate = createdDateProp ?? "Dec 1, 2024";

  // Use smart contract deadline if available, otherwise use prop
  const effectiveDepositDeadline = useMemo(() => {
    if (depositDeadline) {
      return depositDeadline;
    }
    if (nextPayoutDeadline) {
      // Convert bigint timestamp (in seconds) to Date
      return new Date(Number(nextPayoutDeadline) * 1000);
    }
  }, [depositDeadline, nextPayoutDeadline]);

  const countdown = useCountdown(effectiveDepositDeadline);
  const timeRemaining = timeRemainingProp || countdown;
  const progress =
    progressProp ?? (totalWeeks ? (currentWeek / totalWeeks) * 100 : 0);
  const isDepositDue = status === RondaStatus.DEPOSIT_DUE;
  const isActive = status === RondaStatus.ACTIVE;
  const isCompleted = status === RondaStatus.COMPLETED;

  // Check if user is verified
  const {
    data: isVerified,
    isLoading: isLoadingVerification,
    refetch: refetchIsVerified,
  } = useIsUserVerified(
    contractAddress,
    address,
    Boolean(contractAddress && address)
  );

  // Check if user is already a member
  const {
    data: isMember,
    isLoading: isLoadingMember,
    refetch: refetchIsMember,
  } = useIsMember(
    contractAddress,
    address,
    Boolean(contractAddress && address)
  );

  // Join group hook
  const {
    joinGroup,
    isPending: isJoining,
    isSuccess: joinSuccess,
    error: joinError,
  } = useJoinGroup(contractAddress);

  // Mock payout query - only enabled manually when needed
  const {
    refetch: refetchMockPayout,
    isFetching: isFetchingMockPayout,
    error: mockPayoutError,
  } = useMockPayout({
    address: contractAddress || "",
    enabled: false, // Don't auto-fetch, only on manual trigger
  });

  // Handle join success
  useEffect(() => {
    if (joinSuccess && address && groupId) {
      toast.success("Successfully joined the group!");

      // Find the current user's participant record
      const currentUserParticipant = participantsWithStatus.find(
        (p) => p.userAddress.toLowerCase() === address.toLowerCase()
      );

      // Update the participant's accepted status in the backend
      if (currentUserParticipant) {
        updateParticipant({
          groupId,
          participantId: currentUserParticipant.id,
          accepted: true,
          acceptedAt: new Date().toISOString(),
        });
      }

      // Refetch member and verification status to update UI
      refetchParticipants();
      refetchIsMember();
      refetchIsVerified();
    }
  }, [
    joinSuccess,
    address,
    groupId,
    participantsWithStatus,
    updateParticipant,
    refetchIsMember,
    refetchIsVerified,
    refetchParticipants,
  ]);

  // Handle join error
  useEffect(() => {
    if (joinError) {
      let errorMessage = "Failed to join group";
      let errorDescription = "Please try again";

      // Parse common error messages
      const errorString = joinError.message || String(joinError);
      if (errorString.includes("user rejected")) {
        errorMessage = "Transaction rejected";
        errorDescription = "You rejected the transaction";
      } else if (errorString.includes("insufficient funds")) {
        errorMessage = "Insufficient funds";
        errorDescription =
          "You don't have enough funds to complete this transaction";
      } else if (errorString.includes("already a member")) {
        errorMessage = "Already a member";
        errorDescription = "You are already a member of this group";
      } else if (errorString.includes("not invited")) {
        errorMessage = "Not invited";
        errorDescription = "You need to be invited to join this group";
      } else if (errorString.includes("gas")) {
        errorMessage = "Transaction failed";
        errorDescription = "Gas estimation failed. Please try again";
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });

      console.error("Join error:", joinError);
    }
  }, [joinError]);

  // Handle deposit success - refetch all data when deposit completes
  useEffect(() => {
    const handleDepositComplete = async () => {
      // Check if we just completed a deposit (transitioned from depositing to idle)
      if (
        prevDepositStatus === "depositing" &&
        depositStatus === "idle" &&
        !isDepositing
      ) {
        console.log("Deposit completed, refetching data...");

        // Small delay to ensure blockchain state is updated
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Refetch all deposit-related data
        await Promise.all([
          refetchHasDeposited(),
          refetchGroupInfo(),
          refetchNextPayoutDeadline(),
          refetchParticipants(),
        ]);

        console.log("Data refetched successfully");
      }

      // Update previous status
      setPrevDepositStatus(depositStatus);
    };

    handleDepositComplete();
  }, [
    depositStatus,
    isDepositing,
    prevDepositStatus,
    refetchHasDeposited,
    refetchGroupInfo,
    refetchNextPayoutDeadline,
    refetchParticipants,
  ]);

  const handleJoin = () => {
    if (!(contractAddress && address)) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      joinGroup();
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group");
    }
  };

  const handleDecline = () => {
    toast.info("You declined the invitation");
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (mockPayoutError) {
      toast.error("Error in processing payout", {
        duration: 5000,
      });
      setIsProcessingPayout(false);
    }
  }, [mockPayoutError]);

  // Handle mock payout
  const handleMockPayout = async () => {
    if (!contractAddress) {
      toast.error("Contract address is required");
      return;
    }

    setIsProcessingPayout(true);

    try {
      // Call the mock payout endpoint which will distribute funds on-chain
      console.log("refetching mock payout");
      const result = await refetchMockPayout();
      console.log("result", { result });

      // Handle error responses from the API
      if (result.data?.error) {
        const errorMessage = result.data.error;

        // Show user-friendly error message
        toast.error(errorMessage, {
          description: result.data.txHash
            ? `Transaction: ${result.data.txHash.slice(0, 10)}...${result.data.txHash.slice(-8)}`
            : undefined,
          duration: 5000,
        });

        setIsProcessingPayout(false);
        return;
      }

      // Handle successful distribution
      if (result.data?.success) {
        const { addresses, txHash, blockNumber } = result.data;

        if (addresses && addresses.length > 0) {
          toast.success(
            `Successfully distributed funds to ${addresses.length} participant(s)!`,
            {
              description: txHash
                ? `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
                : undefined,
              duration: 5000,
            }
          );

          if (txHash) {
            console.log(`Transaction hash: ${txHash}`);
            console.log(`Block number: ${blockNumber}`);
          }

          // Refetch group data after successful distribution
          try {
            await Promise.all([
              refetchGroupInfo(),
              refetchParticipants(),
              refetchHasDeposited(),
            ]);
          } catch (refetchError) {
            console.error("Error refetching data:", refetchError);
            toast.warning(
              "Payout successful but failed to refresh data. Please reload the page.",
              {
                duration: 5000,
              }
            );
          }
        } else {
          toast.info("Error distributing funds");
          setIsProcessingPayout(false);
        }
      } else {
        // Handle cases where there's a message but no success
        const message = result.data?.message || "Error distributing funds";
        toast.info(message, {
          duration: 4000,
        });
      }

      setIsProcessingPayout(false);
    } catch (error) {
      console.error("Error processing mock payout:", error);

      // Handle different types of errors
      let errorMessage = "Failed to process payout";
      let errorDescription = "Please try again";

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage = "Network error";
          errorDescription = "Please check your connection and try again";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out";
          errorDescription =
            "The transaction may still be processing. Please check back in a moment";
        } else {
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });

      setIsProcessingPayout(false);
    }
  };

  // Determine which button to show based on user state
  // Priority order:
  // 1. Not a member → Show Join button
  // 2. Member but not verified → Show Verify button
  // 3. Member and verified but hasn't deposited → Show Deposit button
  // 4. None of the above → Show no sticky buttons

  const shouldShowJoinButton =
    contractAddress &&
    address &&
    !isLoadingVerification &&
    !isLoadingMember &&
    isMember === false;

  const shouldShowVerifyButton =
    contractAddress &&
    address &&
    !isLoadingVerification &&
    !isLoadingMember &&
    isMember === true &&
    isVerified === false;

  const shouldShowDepositButton =
    contractAddress &&
    address &&
    !isLoadingVerification &&
    !isLoadingMember &&
    isMember === true &&
    isVerified === true &&
    isDepositDue;

  // Verify identity handler
  const handleVerifyIdentity = async () => {
    toast.info("Opening Self verification...");
    if (!(address && contractAddress)) {
      toast.error("Missing required information", {
        description: "Please connect your wallet and try again",
        duration: 4000,
      });
      return;
    }

    try {
      // Build disclosures based on group verification requirements
      const disclosures: {
        nationality?: boolean;
        gender?: boolean;
        date_of_birth?: boolean;
        minimumAge?: number;
        ofac?: boolean;
      } = {};

      if (groupInfo) {
        const verificationType = groupInfo.verificationType;

        // If verification type is not None (0), we need disclosures
        if (verificationType !== 0) {
          // Nationality is required if allowedNationalities is specified
          if (
            groupInfo.allowedNationalities &&
            groupInfo.allowedNationalities.length > 0
          ) {
            disclosures.nationality = true;
          }

          // Gender is required if requiredGender is specified and not empty
          if (groupInfo.requiredGender && groupInfo.requiredGender !== "") {
            disclosures.gender = true;
          }

          // Date of birth is required if minAge is set
          if (groupInfo.minAge && Number(groupInfo.minAge) > 0) {
            disclosures.date_of_birth = true;
            disclosures.minimumAge = Number(groupInfo.minAge);
          }
          disclosures.ofac = false;
        }
      }

      // Generate the scope seed (consistent with contract deployment)
      const scopeSeed = "ronda-test";

      // Build the Self app
      const app = new SelfAppBuilder({
        appName: "Ronda Protocol",
        scope: scopeSeed,
        userId: address,
        userIdType: "hex",
        endpoint: contractAddress.toLowerCase(),
        deeplinkCallback: `https://farcaster.xyz/miniapps/lnjFQwjNJNYE/revu-tunnel/circles/${contractAddress}?verified=true`,
        endpointType: "celo",
        userDefinedData: "Verify your identity to join the group",
        disclosures,
      }).build();

      console.log({
        appName: "Ronda Protocol",
        scope: scopeSeed,
        userId: address,
        userIdType: "hex",
        endpoint: contractAddress.toLowerCase(),
        deeplinkCallback: `https://farcaster.xyz/miniapps/lnjFQwjNJNYE/revu-tunnel/circles/${contractAddress}?verified=true`,
        endpointType: "celo",
        userDefinedData: "Verify your identity to join the group",
        disclosures,
      });

      // Get the universal link
      const deeplink = getUniversalLink(app);
      console.log("deeplink", deeplink);

      // Open the Self app
      await sdk.actions.openUrl(deeplink);
    } catch (error) {
      console.error("Error opening Self verification:", error);

      let errorMessage = "Failed to open verification";
      let errorDescription = "Please try again";

      if (error instanceof Error) {
        if (
          error.message.includes("SDK") ||
          error.message.includes("actions")
        ) {
          errorMessage = "SDK error";
          errorDescription =
            "Unable to open the verification app. Please make sure you're using a supported browser";
        } else {
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    }
  };

  const countdownFormatted = formatCountdown(
    timeRemaining.days,
    timeRemaining.hours,
    timeRemaining.minutes
  );

  const getStatusBadge = () => {
    if (isDepositDue) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(107,155,122,0.1)] px-3 py-1.5 font-semibold text-[#6b9b7a] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Active
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(107,155,122,0.1)] px-3 py-1.5 font-semibold text-[#6b9b7a] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Active
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge
          className="h-[29px] rounded-full border-none bg-[rgba(123,143,245,0.1)] px-3 py-1.5 font-semibold text-[#7b8ff5] text-[11px] uppercase tracking-[0.275px]"
          variant="outline"
        >
          Completed
        </Badge>
      );
    }
    return null;
  };

  return (
    <Drawer onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
      <DrawerTrigger
        asChild={asChild}
        className={cn(
          "w-full cursor-pointer focus:outline-none",
          triggerClassName
        )}
      >
        {children}
      </DrawerTrigger>
      <DrawerContent className="flex h-full w-full flex-col rounded-none border-none focus:outline-none">
        <DrawerHeader className="hidden">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>
        <div className="flex h-[69px] w-full shrink-0 items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-4">
          <motion.button
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[rgba(244,244,245,0.5)]"
            onClick={(e) => {
              e.stopPropagation();
              setIsDrawerOpen(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            type="button"
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="size-6 text-zinc-950" strokeWidth={2} />
          </motion.button>
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold text-[18px] text-zinc-950 tracking-[-0.45px]">
              {name}
            </span>
            <span className="text-[#6f7780] text-[12px]">
              {memberCount} members • {weeklyAmount}/week
            </span>
          </div>
          <div className="size-11 shrink-0 rounded-full bg-transparent" />
        </div>

        <ScrollArea
          className="w-full flex-1"
          scrollBarClassName="opacity-0 w-0"
        >
          <div
            className={`flex w-full flex-col gap-6 px-4 py-6 ${
              shouldShowJoinButton ||
              shouldShowVerifyButton ||
              shouldShowDepositButton
                ? "pb-32"
                : "pb-6"
            }`}
          >
            <Card className="flex w-full flex-col gap-6 rounded-[24px] border border-[rgba(232,235,237,0.5)] bg-white p-6 shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col items-start">
                    <h2 className="font-bold text-[18px] text-zinc-950 tracking-[-0.45px]">
                      {name}
                    </h2>
                    <p className="text-muted-foreground/40 text-xs">
                      {normalizeToSlug(name)}.rosca.eth
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#6f7780] text-[12px]">
                    <Calendar className="size-3.5" strokeWidth={2} />
                    <span className="font-normal">Created {createdDate}</span>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {potAmount}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Pot Amount
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {nextPayout}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Next Payout
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
                    {currentWeek}/{totalWeeks}
                  </span>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Weeks
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#6f7780] text-[14px]">
                    Progress
                  </span>
                  <span className="font-normal text-[#6f7780] text-[12px]">
                    {weeklyAmount} per member, per week
                  </span>
                </div>
                <Progress
                  className="h-2.5 rounded-full bg-[rgba(244,244,245,0.5)]"
                  progressBarClassName="bg-[#7b8ff5] rounded-full"
                  value={progress}
                />
              </div>

              {hasDeposited && address ? (
                <>
                  <div className="flex items-center justify-between rounded-2xl border border-[rgba(107,155,122,0.6)] bg-emerald-500/20 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-[#6b9b7a]">
                        <Check
                          className="size-3.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-zinc-950 tracking-[-0.35px]">
                          {depositAmount} Deposited
                        </span>
                        <span className="font-normal text-[#6f7780] text-[11px]">
                          Next deposit due {nextPayout}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className="rounded-full border-none bg-[rgba(107,155,122,0.2)] px-2 py-1 font-bold text-[#6b9b7a] text-[10px] uppercase tracking-[0.25px]"
                      variant="outline"
                    >
                      Paid
                    </Badge>
                  </div>

                  {/* Mock Payout Button */}
                  <Button
                    className="relative z-10 h-14 w-full cursor-pointer rounded-2xl border border-[rgba(123,143,245,0.3)] bg-[#7b8ff5] font-semibold text-[14px] text-white tracking-[-0.35px] hover:bg-[#7b8ff5]/90 disabled:opacity-70"
                    disabled={isProcessingPayout || isFetchingMockPayout}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleMockPayout();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    type="button"
                  >
                    <AnimatePresence mode="wait">
                      {isFetchingMockPayout || isProcessingPayout ? (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="pointer-events-none flex items-center justify-center"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key="processing"
                        >
                          <Loader2 className="mr-2 size-5 animate-spin" />
                          {isFetchingMockPayout
                            ? "Processing payout..."
                            : "Distributing funds..."}
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="pointer-events-none flex items-center justify-center"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          key="mock-payout"
                        >
                          <Wallet className="mr-2 size-5" strokeWidth={2} />
                          Mock Payout
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </>
              ) : null}

              {/* Deposit Deadline Card */}
              {isDepositDue && (
                <div className="flex flex-col gap-4 rounded-2xl border border-[rgba(245,158,66,0.3)] bg-linear-to-b from-warning/20 to-warning/5 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="size-5 text-zinc-950" strokeWidth={2} />
                      <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
                        Deposit Deadline
                      </span>
                    </div>
                    <Badge
                      className="rounded-full border-none bg-[rgba(245,158,66,0.2)] px-2 py-1 font-bold text-[#f59e42] text-[10px] uppercase tracking-[0.25px]"
                      variant="outline"
                    >
                      Urgent
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[#f59e42] text-[36px] leading-[40px] tracking-[-0.9px]">
                      {countdownFormatted.days} {countdownFormatted.hours}
                    </span>
                    <span className="font-semibold text-[18px] text-[rgba(245,158,66,0.7)] leading-[28px] tracking-[-0.45px]">
                      {countdownFormatted.minutes}
                    </span>
                  </div>
                  <span className="font-medium text-[#6f7780] text-[12px]">
                    Time remaining to deposit {depositAmount} for this week
                  </span>
                </div>
              )}
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[16px] text-zinc-950 tracking-[-0.4px]">
                Members
              </h2>
              <motion.button
                className="cursor-pointer font-semibold text-[12px] text-zinc-900 tracking-[-0.3px] hover:underline"
                onClick={onViewAllMembers}
                whileTap={{ scale: 0.98 }}
              >
                View all {memberCount} members
              </motion.button>
            </div>

            <div className="flex w-full flex-col gap-2">
              {isLoadingParticipants ? (
                // Loading state
                <>
                  <ProfileCard
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=loading1"
                    name="Loading..."
                    status="pending"
                    statusMessage="Loading participants"
                  />
                  <ProfileCard
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=loading2"
                    name="Loading..."
                    status="pending"
                    statusMessage="Loading participants"
                  />
                </>
              ) : participantsWithStatus.length > 0 ? (
                // Show real participants from backend
                participantsWithStatus
                  .slice(0, 5)
                  .map((participant) => (
                    <ParticipantProfileCard
                      currentUserAddress={address}
                      key={participant.id}
                      participant={participant}
                    />
                  ))
              ) : members && members.length > 0 ? (
                // Fallback to prop members
                members.map((member, index) => (
                  <ProfileCard
                    avatar={member.avatar}
                    key={`${member.name}-${member.avatar}-${index}`}
                    name={member.name}
                    status={member.status}
                    statusMessage={member.statusMessage || ""}
                  />
                ))
              ) : (
                // Default placeholder
                <>
                  <ProfileCard
                    avatar="https://github.com/shadcn.png"
                    name="You"
                    status={isDepositDue ? "due" : "accepted"}
                    statusMessage={
                      isDepositDue ? "Due weekly deposit" : "Paid this week"
                    }
                  />
                  <ProfileCard
                    avatar="https://github.com/shadcn.png"
                    name="Alex R."
                    status="accepted"
                    statusMessage="Paid this week"
                  />
                </>
              )}
            </div>

            {activities && activities.length > 0 && (
              <>
                <div className="flex items-center justify-start">
                  <h2 className="font-bold text-[16px] text-zinc-950 tracking-[-0.4px]">
                    Recent Activity
                  </h2>
                </div>
                <div className="flex w-full flex-col gap-4">
                  {activities.map((activity, index) => (
                    <div
                      className="flex items-start justify-between gap-2"
                      key={`activity-${activity.title}-${activity.timestamp}-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-2xl",
                            activity.iconBg || "bg-[rgba(107,155,122,0.1)]"
                          )}
                        >
                          <activity.icon
                            className="size-5 text-zinc-950"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex flex-col items-start justify-center">
                          <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
                            {activity.title}
                          </span>
                          <span className="font-normal text-[#6f7780] text-[12px]">
                            {activity.message}
                          </span>
                        </div>
                      </div>
                      <span className="font-normal text-[#6f7780] text-[12px]">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Join Button - Show if verified and not a member */}
        {shouldShowJoinButton && !isDepositDue && (
          <div className="sticky bottom-0 flex w-full gap-3 border-border border-t bg-white p-4">
            <Button
              className="h-16 w-[48%] cursor-pointer rounded-[24px] bg-transparent font-semibold text-[16px] text-muted tracking-[-0.4px] shadow-sm hover:bg-muted-foreground/5 disabled:opacity-50"
              disabled={isJoining}
              onClick={(e) => {
                e.stopPropagation();
                handleDecline();
              }}
            >
              Decline
            </Button>
            <Button
              className="h-16 w-1/2 cursor-pointer rounded-[24px] bg-primary font-semibold text-[16px] text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90 disabled:opacity-50"
              disabled={isJoining}
              onClick={(e) => {
                e.stopPropagation();
                handleJoin();
              }}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 size-5" strokeWidth={2} />
                  Accept
                </>
              )}
            </Button>
          </div>
        )}

        {/* Verification Required - Show if member but not verified */}
        {shouldShowVerifyButton && (
          <div
            className="flex w-full shrink-0 flex-col gap-3 border-[rgba(232,235,237,0.5)] border-t bg-white p-4"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Why Verification Card */}
            <div className="w-full rounded-2xl border border-[rgba(123,143,245,0.3)] bg-linear-to-b bg-primary/10 from-[rgba(123,143,245,0.1)] to-[rgba(123,143,245,0.05)] p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#7b8ff5]">
                    <Shield className="size-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-bold text-[#7b8ff5] text-sm tracking-[-0.35px]">
                    Why Verification?
                  </p>
                  <p className="text-[#6f7780] text-xs leading-[19.5px]">
                    Identity verification helps protect all members, prevents
                    fraud, and ensures everyone meets the circle requirements.
                    This step is required to participate in the group.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify Identity Button */}
            <Button
              className="h-[52px] w-full rounded-2xl bg-[#7b8ff5] font-semibold text-base text-white tracking-[-0.4px] hover:bg-[#7b8ff5]/90"
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyIdentity();
              }}
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-white/20">
                <Check className="size-4 text-white" />
              </div>
              Verify Identity Now
            </Button>
          </div>
        )}

        {/* Deposit Button - Show if member, verified, and deposit is due */}
        {shouldShowDepositButton && (
          <div
            className="flex w-full shrink-0 border-[rgba(232,235,237,0.5)] border-t bg-white p-4"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              className="h-16 w-full cursor-pointer rounded-[24px] bg-[#f59e42] font-semibold text-[16px] text-white tracking-[-0.4px] shadow-[0px_4px_6px_-4px_rgba(245,158,66,0.3),0px_10px_15px_-3px_rgba(245,158,66,0.3)] hover:bg-[#f59e42]/90 disabled:opacity-70"
              disabled={isDepositing}
              onClick={(e) => {
                e.stopPropagation();
                onDeposit?.();
              }}
            >
              <AnimatePresence mode="wait">
                {depositStatus === "approving" ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="approving"
                  >
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Approving...
                  </motion.div>
                ) : depositStatus === "depositing" ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="depositing"
                  >
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Depositing...
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="deposit-now"
                  >
                    <Wallet className="mr-2 size-5" strokeWidth={2} />
                    Deposit {depositAmount} Now
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

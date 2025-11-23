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
import { RondaStatus } from "@/lib/enum";
import {
  useGetGroupInfoDetailed,
  useGetNextPayoutDeadline,
  useGetPeriodDeposits,
  useHasUserDepositedCurrentPeriod,
  useIsMember,
  useIsUserVerified,
  useJoinGroup,
} from "@/lib/smart-contracts/hooks";
import { cn } from "@/utils";
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
  // Members and activity
  members?: Member[];
  activities?: Activity[];
  // Backend group ID for fetching participants
  groupId?: string;
  // Actions
  onDeposit?: () => void;
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
  members,
  activities,
  groupId,
  onDeposit,
  onViewAllMembers,
}: RondaDrawerProps) => {
  const { address } = useAccount();

  // Fetch participants with their status from backend and blockchain
  const {
    participants: participantsWithStatus,
    isLoading: isLoadingParticipants,
  } = useGroupParticipantsWithStatus({
    groupId: groupId ?? "",
    contractAddress,
    enabled: !!groupId,
  });

  // Fetch on-chain data
  const { data: groupInfo } = useGetGroupInfoDetailed(
    contractAddress,
    !!contractAddress
  );
  const { data: hasDeposited } = useHasUserDepositedCurrentPeriod(
    contractAddress,
    address,
    !!contractAddress && !!address
  );

  // Get next payout deadline from smart contract
  const { data: nextPayoutDeadline } = useGetNextPayoutDeadline(
    contractAddress,
    !!contractAddress
  );

  // Get current period deposits for pot amount
  const currentOperationIndex = useMemo(
    () => groupInfo?.currentOperationIndex,
    [groupInfo]
  );

  const { data: periodDeposits } = useGetPeriodDeposits(
    contractAddress,
    currentOperationIndex,
    !!contractAddress && currentOperationIndex !== undefined
  );

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

  // Calculate pot amount from on-chain data
  const potAmount = useMemo(() => {
    if (potAmountProp) {
      console.log("Pot amount prop", potAmountProp);
      return potAmountProp;
    }

    if (periodDeposits) {
      const deposits = Number(
        formatUnits(periodDeposits as bigint, USDC_DECIMALS)
      );
      return `$${deposits.toFixed(2)}`;
    }

    // Fallback: estimate based on recurring amount and current week
    const estimatedPot = recurringAmount * currentWeek;
    return `$${estimatedPot.toFixed(2)}`;
  }, [potAmountProp, periodDeposits, recurringAmount, currentWeek]);

  // Calculate next payout date based on smart contract deadline
  const nextPayout = useMemo(() => {
    if (nextPayoutProp) {
      console.log("Next payout prop", nextPayoutProp);
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
      console.log("No group info");
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
      console.log("Status prop", statusProp);
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
  const { data: isVerified, isLoading: isLoadingVerification } =
    useIsUserVerified(
      contractAddress,
      address,
      Boolean(contractAddress && address)
    );

  // Check if user is already a member
  const { data: isMember, isLoading: isLoadingMember } = useIsMember(
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

  // Handle join success
  useEffect(() => {
    if (joinSuccess) {
      toast.success("Successfully joined the group!");
    }
  }, [joinSuccess]);

  // Handle join error
  useEffect(() => {
    if (joinError) {
      toast.error("Failed to join group. Please try again.");
      console.error("Join error:", joinError);
    }
  }, [joinError]);

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

  // Determine if we should show join button or disclaimer
  const shouldShowJoinButton =
    contractAddress &&
    address &&
    !isLoadingVerification &&
    !isLoadingMember &&
    isVerified === true &&
    isMember === false;

  const shouldShowDisclaimer =
    contractAddress &&
    address &&
    !isLoadingVerification &&
    !isLoadingMember &&
    isVerified === false;

  // Verify identity handler
  const handleVerifyIdentity = async () => {
    toast.info("Opening Self verification...");
    if (!(address && contractAddress)) {
      toast.error("Missing required information for verification");
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

          // OFAC is always enabled when verification is required
          disclosures.ofac = true;
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

      // Get the universal link
      const deeplink = getUniversalLink(app);

      // Open the Self app
      await sdk.actions.openUrl(deeplink);
    } catch (error) {
      console.error("Error opening Self verification:", error);
      toast.error("Failed to open verification");
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
      <DrawerContent className="w-full rounded-none border-none focus:outline-none">
        <DrawerHeader className="hidden">
          <DrawerTitle />
          <DrawerDescription />
        </DrawerHeader>
        <div className="flex h-[69px] w-full items-center justify-between border-[rgba(232,235,237,0.5)] border-b bg-white px-4">
          <motion.button
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[rgba(244,244,245,0.5)]"
            onClick={() => setIsDrawerOpen(false)}
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
              {memberCount} members • {weeklyAmount}
            </span>
          </div>
          <div className="size-11 shrink-0 rounded-full bg-transparent" />
        </div>

        <ScrollArea
          className={cn(
            "w-full",
            isDepositDue ? "h-[calc(100vh-69px-80px)]" : "h-[calc(100vh-69px)]"
          )}
          scrollBarClassName="opacity-0 w-0"
        >
          <div className="flex w-full flex-col gap-6 px-4 py-6">
            <Card className="flex w-full flex-col gap-6 rounded-[24px] border border-[rgba(232,235,237,0.5)] bg-white p-6 shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-[18px] text-zinc-950 tracking-[-0.45px]">
                    {name}
                  </h2>
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

        {/* Deposit Button for Deposit Due State */}
        {isDepositDue && (
          <div className="flex w-full border-[rgba(232,235,237,0.5)] border-t bg-white p-4">
            <Button
              className="h-16 w-full cursor-pointer rounded-[24px] bg-[#f59e42] font-semibold text-[16px] text-white tracking-[-0.4px] shadow-[0px_4px_6px_-4px_rgba(245,158,66,0.3),0px_10px_15px_-3px_rgba(245,158,66,0.3)] hover:bg-[#f59e42]/90"
              disabled={isDepositing}
              onClick={onDeposit}
            >
              <AnimatePresence mode="wait">
                {isDepositing ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="depositing"
                  >
                    <Loader2 className="mr-2 size-5 animate-spin" />
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

        {/* Join Button - Show if verified and not a member */}
        {shouldShowJoinButton && !isDepositDue && (
          <div className="sticky bottom-0 flex w-full border-[rgba(232,235,237,0.5)] border-t bg-white p-4">
            <Button
              className="h-16 w-full cursor-pointer rounded-[24px] bg-primary font-semibold text-[16px] text-white tracking-[-0.4px] shadow-sm hover:bg-primary/90 disabled:opacity-50"
              disabled={isJoining}
              onClick={handleJoin}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 size-5" strokeWidth={2} />
                  Join Group
                </>
              )}
            </Button>
          </div>
        )}

        {/* Verification Required - Show if not verified */}
        {shouldShowDisclaimer && !isDepositDue && (
          <div className="sticky bottom-0 flex w-full flex-col gap-3 border-[rgba(232,235,237,0.5)] border-t bg-white p-4">
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
                    This step is required before you can join.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify Identity Button */}
            <Button
              className="h-[52px] w-full rounded-2xl bg-[#7b8ff5] font-semibold text-base text-white tracking-[-0.4px] hover:bg-[#7b8ff5]/90"
              onClick={handleVerifyIdentity}
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-white/20">
                <Check className="size-4 text-white" />
              </div>
              Verify Identity Now
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

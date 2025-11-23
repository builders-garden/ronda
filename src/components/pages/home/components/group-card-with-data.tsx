"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { CircleCard } from "@/components/pages/circles/components/circle-card";
import { useGroupParticipants } from "@/hooks/use-group-participants";
import type { groups } from "@/lib/database/db.schema";
import type { CirclesPageContent } from "@/lib/enum";
import {
  useGetGroupInfoDetailed,
  useGetPeriodDeposits,
  useHasUserDepositedCurrentPeriod,
} from "@/lib/smart-contracts/hooks";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

type Group = typeof groups.$inferSelect;

export type GroupCardData = {
  address: string;
  name: string;
  memberCount: number;
  weeklyAmount: string;
  currentWeek: number;
  totalWeeks: number;
  currentPot: string;
  nextPayout?: string;
  lastPayout?: string;
  status: "active" | "deposit_due" | "completed";
  avatars: string[];
  createdDate?: string;
};

export function GroupCardWithData({
  group,
  initialPageContent,
}: {
  group: Group;
  initialPageContent?: CirclesPageContent;
}) {
  const { address: userAddress } = useAccount();
  const groupAddress = group.groupAddress as Address | undefined;

  // Fetch participants for member count
  const { data: participantsData } = useGroupParticipants({
    groupId: group.id,
    enabled: !!group.id,
  });

  // Read onchain data
  const { data: groupInfo } = useGetGroupInfoDetailed(
    groupAddress,
    !!groupAddress
  );
  const { data: hasDeposited } = useHasUserDepositedCurrentPeriod(
    groupAddress,
    userAddress,
    !!groupAddress && !!userAddress
  );

  // Get current period deposits for current pot
  const currentOperationIndex = useMemo(
    () => groupInfo?.currentOperationIndex,
    [groupInfo]
  );

  const { data: periodDeposits } = useGetPeriodDeposits(
    groupAddress,
    currentOperationIndex,
    !!groupAddress && currentOperationIndex !== undefined
  );

  // Memoize computed values to prevent unnecessary re-renders
  const cardData = useMemo(() => {
    // Wait for groupInfo to be loaded (undefined means still loading)
    if (!groupAddress || groupInfo === undefined) {
      return null;
    }

    // If groupInfo is null or false, the group doesn't exist on-chain
    if (!groupInfo) {
      return null;
    }

    if (!groupInfo.exists) {
      return null;
    }

    // Calculate weekly amount
    const recurringAmount = Number(
      formatUnits(groupInfo.recurringAmount ?? BigInt(0), USDC_DECIMALS)
    );
    const weeklyAmount = `$${recurringAmount.toFixed(0)}`;

    // Calculate total weeks and current week
    // operationCounter represents the total number of operations (periods)
    // currentOperationIndex is 0-based, so current week is index + 1
    const totalWeeks = Number(groupInfo.operationCounter) || 1;
    const currentWeek = Math.min(
      Number(groupInfo.currentOperationIndex) + 1,
      totalWeeks
    );

    // Calculate current pot
    let currentPot = "$0";
    if (periodDeposits) {
      // periodDeposits is a bigint representing the total deposits in the current period
      const deposits = Number(
        formatUnits(periodDeposits as bigint, USDC_DECIMALS)
      );
      currentPot = `$${deposits.toFixed(0)}`;
    } else {
      // Fallback: estimate based on recurring amount and current week
      const estimatedPot = recurringAmount * currentWeek;
      currentPot = `$${estimatedPot.toFixed(0)}`;
    }

    // Determine status
    let status: "active" | "deposit_due" | "completed" = "active";
    if (currentWeek >= totalWeeks) {
      status = "completed";
    } else if (!hasDeposited && userAddress) {
      status = "deposit_due";
    }

    // Calculate next payout date based on deposit frequency
    // depositFrequency is in seconds, convert to days
    const depositFrequencyDays =
      Number(groupInfo.depositFrequency) / (24 * 60 * 60);
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(
      nextPayoutDate.getDate() + Math.ceil(depositFrequencyDays)
    );
    const nextPayout = nextPayoutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Last payout for completed circles
    const lastPayoutDate = new Date();
    lastPayoutDate.setDate(
      lastPayoutDate.getDate() - Math.ceil(depositFrequencyDays)
    );
    const lastPayout = lastPayoutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Get member count from participants
    const memberCount = participantsData?.participants.length || 0;
    // For avatars, we'll use empty array for now
    // To get avatars, we'd need to fetch user data for each participant
    const avatars: string[] = [];

    // Format created date from group
    const createdDate = group.createdAt
      ? new Date(group.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined;

    return {
      address: groupAddress,
      name: group.name,
      memberCount,
      weeklyAmount,
      currentWeek,
      totalWeeks,
      currentPot,
      nextPayout: status !== "completed" ? nextPayout : undefined,
      lastPayout: status === "completed" ? lastPayout : undefined,
      status,
      avatars,
      createdDate,
    };
  }, [
    groupInfo,
    groupAddress,
    group.name,
    group.createdAt,
    periodDeposits,
    hasDeposited,
    userAddress,
    participantsData,
  ]);

  if (!cardData) {
    return null;
  }

  return (
    <CircleCard
      address={cardData.address}
      avatars={cardData.avatars}
      createdDate={cardData.createdDate}
      currentPot={cardData.currentPot}
      currentWeek={cardData.currentWeek}
      initialContent={initialPageContent}
      lastPayout={cardData.lastPayout}
      memberCount={cardData.memberCount}
      name={cardData.name}
      nextPayout={cardData.nextPayout}
      status={cardData.status}
      totalWeeks={cardData.totalWeeks}
      weeklyAmount={cardData.weeklyAmount}
    />
  );
}
